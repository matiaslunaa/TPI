from typing import List

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int):
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def _obtener_activa(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        # Una categoría dada de baja se trata como inexistente
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    def listar(self) -> List[CategoriaRead]:
        with self.uow as uow:
            return [
                CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()
            ]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(
                self._obtener_activa(uow, categoria_id)
            )

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre = data.nombre.strip()
            if uow.categorias.get_by_nombre(nombre) is not None:
                raise NombreDuplicado(nombre)
            categoria = uow.categorias.add(
                Categoria(nombre=nombre, descripcion=data.descripcion)
            )
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            nombre = cambios.get("nombre")
            if nombre is not None:
                nombre = nombre.strip()
                existente = uow.categorias.get_by_nombre(nombre)
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado(nombre)
                categoria.nombre = nombre
            if "descripcion" in cambios:
                categoria.descripcion = cambios["descripcion"]
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._obtener_activa(uow, categoria_id)
            categoria.activo = False  # baja lógica
            uow.categorias.add(categoria)
