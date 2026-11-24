from typing import Optional

from sqlalchemy.exc import IntegrityError

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        try:
            with self.uow as uow:
                if (
                    uow.usuarios.get_by_username(data.username) is not None
                    or uow.usuarios.get_by_email(data.email) is not None
                ):
                    raise UsuarioDuplicado()
                usuario = uow.usuarios.add(
                    Usuario(
                        username=data.username,
                        full_name=data.full_name,
                        email=data.email,
                        hashed_password=hash_password(data.password),
                        role="user",
                    )
                )
                return UserPublic.model_validate(usuario)
        except IntegrityError:
            raise UsuarioDuplicado()

    def autenticar(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None and "@" in username:
                usuario = uow.usuarios.get_by_email(username)
            if usuario is None or not verify_password(
                password, usuario.hashed_password
            ):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token({"sub": usuario.username})

    def obtener_por_username(self, username: str) -> Optional[UserPublic]:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None:
                return None
            return UserPublic.model_validate(usuario)
