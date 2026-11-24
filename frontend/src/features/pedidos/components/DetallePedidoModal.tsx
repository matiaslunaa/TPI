import BadgeEstado from "@/shared/ui/BadgeEstado";
import Modal from "@/shared/ui/Modal";
import { formatFecha, formatPrecio } from "@/shared/utils/format";
import type { Pedido } from "../types/pedido";

interface Props {
  pedido: Pedido;
  onClose: () => void;
}

export default function DetallePedidoModal({ pedido, onClose }: Props) {
  return (
    <Modal titulo={`Pedido #${pedido.id}`} onClose={onClose}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <BadgeEstado estado={pedido.estado} />
          <span className="text-stone-500">{formatFecha(pedido.created_at)}</span>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="font-semibold">Dirección:</dt>
          <dd>{pedido.direccion_entrega}</dd>
          <dt className="font-semibold">Pago:</dt>
          <dd>{pedido.forma_pago}</dd>
          {pedido.notas && (
            <>
              <dt className="font-semibold">Notas:</dt>
              <dd>{pedido.notas}</dd>
            </>
          )}
        </dl>

        <table className="w-full text-left">
          <thead className="text-xs uppercase text-stone-500">
            <tr>
              <th className="py-1">Producto</th>
              <th className="py-1 text-right">Cant.</th>
              <th className="py-1 text-right">Precio</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item) => (
              <tr key={item.producto_id} className="border-t border-stone-100">
                <td className="py-1.5">{item.nombre_producto}</td>
                <td className="py-1.5 text-right">{item.cantidad}</td>
                <td className="py-1.5 text-right">{formatPrecio(item.precio_unitario)}</td>
                <td className="py-1.5 text-right">{formatPrecio(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="border-t border-stone-200 pt-2 text-right text-base font-extrabold">
          Total: {formatPrecio(pedido.total)}
        </p>
      </div>
    </Modal>
  );
}
