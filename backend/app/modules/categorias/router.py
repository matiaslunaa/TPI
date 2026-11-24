from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Response

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork(session_factory))


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
AdminDep = Annotated[UserPublic, Depends(require_role(["admin"]))]


@router.get("", response_model=List[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", response_model=CategoriaRead, status_code=201)
def crear_categoria(data: CategoriaCreate, _admin: AdminDep, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    _admin: AdminDep,
    service: ServiceDep,
):
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete("/{categoria_id}", status_code=204, response_class=Response)
def eliminar_categoria(categoria_id: int, _admin: AdminDep, service: ServiceDep):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))
    return Response(status_code=204)
