from typing import List, Optional

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        # Incluye las dadas de baja: la baja lógica no libera el nombre único
        query = select(Categoria).where(
            func.lower(Categoria.nombre) == nombre.strip().lower()
        )
        return self.session.exec(query).first()

    def list_activas(self) -> List[Categoria]:
        query = (
            select(Categoria)
            .where(col(Categoria.activo).is_(True))
            .order_by(col(Categoria.nombre))
        )
        return list(self.session.exec(query).all())
