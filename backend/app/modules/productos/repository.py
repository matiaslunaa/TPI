from typing import List, Optional, Tuple

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Producto], int]:
        query = select(Producto).where(col(Producto.activo).is_(True))
        if search and search.strip():
            query = query.where(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            query = query.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            query = query.where(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(query.subquery())
        ).one()
        items = self.session.exec(
            query.order_by(col(Producto.id)).offset(skip).limit(limit)
        ).all()
        return list(items), int(total)
