from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork(session_factory))


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
AdminDep = Annotated[UserPublic, Depends(require_role(["admin"]))]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Búsqueda por nombre"),
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
):
    return service.listar(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", response_model=ProductoRead, status_code=201)
def crear_producto(data: ProductoCreate, _admin: AdminDep, service: ServiceDep):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    _admin: AdminDep,
    service: ServiceDep,
):
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    _admin: AdminDep,
    service: ServiceDep,
):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{producto_id}", status_code=204, response_class=Response)
def eliminar_producto(producto_id: int, _admin: AdminDep, service: ServiceDep):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    return Response(status_code=204)
