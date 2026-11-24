from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def search(
        self,
        usuario_id: Optional[int] = None,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Pedido], int]:
        query = select(Pedido)
        if usuario_id is not None:
            query = query.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            query = query.where(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(query.subquery())
        ).one()
        items = self.session.exec(
            query.order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return list(items), int(total)

    def list_by_usuario(
        self, usuario_id: int, estado: Optional[str] = None, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Pedido], int]:
        return self.search(usuario_id=usuario_id, estado=estado, skip=skip, limit=limit)

    def count_by_estado(self) -> Dict[str, int]:
        query = select(col(Pedido.estado), func.count()).group_by(col(Pedido.estado))
        return {estado: int(cantidad) for estado, cantidad in self.session.exec(query).all()}

    def count_desde(self, desde: datetime) -> int:
        query = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return int(self.session.exec(query).one())

    def sum_total_by_estado(self, estado: str) -> float:
        query = select(func.coalesce(func.sum(Pedido.total), 0)).where(
            Pedido.estado == estado
        )
        return float(self.session.exec(query).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)
