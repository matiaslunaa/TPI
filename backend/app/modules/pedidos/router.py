from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.database import session_factory
from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.enums import EstadoPedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork(session_factory))


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
UserDep = Annotated[UserPublic, Depends(get_current_active_user)]
AdminDep = Annotated[UserPublic, Depends(require_role(["admin"]))]


@router.post("", response_model=PedidoRead, status_code=201)
def crear_pedido(data: PedidoCreate, user: UserDep, service: ServiceDep):
    try:
        return service.crear(data, usuario_id=user.id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except (StockInsuficiente, ProductoNoDisponible, ProductoRepetido) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    user: UserDep,
    service: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoPedido] = None,
):
    return service.listar(user, skip=skip, limit=limit, estado=estado)


@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminDep, service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, user: UserDep, service: ServiceDep):
    try:
        return service.obtener(pedido_id, user)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int, data: CambioEstado, _admin: AdminDep, service: ServiceDep
):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except TransicionInvalida as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, user: UserDep, service: ServiceDep):
    try:
        return service.cancelar_propio(pedido_id, usuario_id=user.id)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status_code=403, detail=str(e))
    except (PedidoNoCancelable, TransicionInvalida) as e:
        raise HTTPException(status_code=400, detail=str(e))
