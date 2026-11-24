from typing import List, Optional

from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        query = select(Usuario).where(Usuario.username == username.strip())
        return self.session.exec(query).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        query = select(Usuario).where(Usuario.email == email.strip().lower())
        return self.session.exec(query).first()

    def list_all(self) -> List[Usuario]:
        query = select(Usuario).order_by(col(Usuario.id))
        return list(self.session.exec(query).all())
