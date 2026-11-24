from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork(session_factory))


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]
AdminDep = Annotated[UserPublic, Depends(require_role(["admin"]))]


@router.get("", response_model=List[UserPublic])
def listar_usuarios(_admin: AdminDep, service: ServiceDep):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _admin: AdminDep, service: ServiceDep):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: AdminDep, service: ServiceDep):
    try:
        return service.desactivar(usuario_id, actor_id=admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except AutoDesactivacion:
        raise HTTPException(
            status_code=400, detail="No podés desactivar tu propia cuenta"
        )
