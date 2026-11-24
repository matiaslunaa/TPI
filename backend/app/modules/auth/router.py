from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_auth_service, get_current_active_user
from app.modules.auth.schemas import MensajeResponse
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado

COOKIE_NAME = "access_token"

router = APIRouter(prefix="/auth", tags=["auth"])

ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=201)
def register(data: UserCreate, service: ServiceDep):
    try:
        return service.registrar(data)
    except UsuarioDuplicado:
        raise HTTPException(
            status_code=409, detail="El username o el email ya están registrados"
        )


@router.post("/token", response_model=MensajeResponse)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
):
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesInvalidas:
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except CuentaDesactivada:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return MensajeResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: Annotated[UserPublic, Depends(get_current_active_user)]):
    return current_user
