from typing import List

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int):
        super().__init__(f"Usuario {usuario_id} no encontrado")


class UsuarioDuplicado(Exception):
    pass


class AutoDesactivacion(Exception):
    pass


class UsuarioService:

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> List[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def _cambiar_estado(self, usuario_id: int, disabled: bool) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(usuario_id)
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=False)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        if usuario_id == actor_id:
            raise AutoDesactivacion()
        return self._cambiar_estado(usuario_id, disabled=True)
