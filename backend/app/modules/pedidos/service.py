from datetime import datetime
from typing import Dict, List, Optional

from app.core.utils import ahora
from app.modules.pedidos.enums import EstadoPedido
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic


# Excepciones de dominio
class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"Producto {producto_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, stock: int, pedido: int):
        super().__init__(
            f"Stock insuficiente de '{nombre}': hay {stock} y se pidieron {pedido}"
        )


class ProductoRepetido(Exception):
    def __init__(self) -> None:
        super().__init__("No se puede repetir un producto en el mismo pedido")


class TransicionInvalida(Exception):
    def __init__(self, actual: str, nuevo: str):
        super().__init__(f"Transición inválida: {actual} → {nuevo}")


class PedidoNoCancelable(Exception):
    def __init__(self) -> None:
        super().__init__("Solo se pueden cancelar pedidos en estado PENDIENTE")


# Máquina de estados: estado actual -> estados a los que puede pasar
TRANSICIONES: Dict[EstadoPedido, List[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: [EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO],
    EstadoPedido.EN_PREPARACION: [EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO],
    EstadoPedido.ENTREGADO: [],
    EstadoPedido.CANCELADO: [],
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    # crear pedido (una sola transacción)
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(set(ids)) != len(ids):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=EstadoPedido.PENDIENTE.value,
                    forma_pago=data.forma_pago.value,
                    direccion_entrega=data.direccion_entrega.strip(),
                    notas=data.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        producto.nombre, producto.stock, item.cantidad
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    # Consultas
    def listar(
        self,
        usuario: UserPublic,
        skip: int,
        limit: int,
        estado: Optional[EstadoPedido] = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            estado_valor = estado.value if estado else None
            if usuario.role == "admin":
                items, total = uow.pedidos.search(
                    estado=estado_valor, skip=skip, limit=limit
                )
            else:
                items, total = uow.pedidos.list_by_usuario(
                    usuario.id, estado=estado_valor, skip=skip, limit=limit
                )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # Cambio de estado y cancelación con restitución de stock
    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad
                uow.productos.add(producto)

    def _aplicar_transicion(
        self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido
    ) -> None:
        actual = EstadoPedido(pedido.estado)
        # Toda transición se valida antes de modificar el pedido
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(actual.value, nuevo.value)
        if nuevo == EstadoPedido.CANCELADO:
            self._restituir_stock(uow, pedido)
        pedido.estado = nuevo.value
        pedido.updated_at = ahora()
        uow.pedidos.add(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise PedidoNoCancelable()
            self._aplicar_transicion(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    # Resumen para el panel
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_dia = datetime.combine(ahora().date(), datetime.min.time())
            return ResumenPedidos(
                pendientes=conteos.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=conteos.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=conteos.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=conteos.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_dia),
                ingresos_entregados=uow.pedidos.sum_total_by_estado(
                    EstadoPedido.ENTREGADO.value
                ),
            )
