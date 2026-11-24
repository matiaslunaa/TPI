import { useCallback, useMemo, useState } from "react";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { etiquetaEstado } from "@/shared/utils/format";
import DetallePedidoModal from "../components/DetallePedidoModal";
import TablaPedidos from "../components/TablaPedidos";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS, type EstadoPedido, type Pedido } from "../types/pedido";

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | "">("");
  const [detalle, setDetalle] = useState<Pedido | null>(null);

  const consulta = usePedidos({
    skip: 0,
    limit: 100,
    estado: estado === "" ? undefined : estado,
  });
  const cambiar = useCambiarEstadoPedido();
  const { mutate: cambiarEstado } = cambiar;

  const items = useMemo(() => consulta.data?.items ?? [], [consulta.data]);

  const handleCambiarEstado = useCallback(
    (pedido: Pedido, nuevo: EstadoPedido) => {
      if (
        nuevo === "CANCELADO" &&
        !window.confirm(
          `¿Cancelar el pedido #${pedido.id}? Se va a restituir el stock.`,
        )
      ) {
        return;
      }
      cambiarEstado({ id: pedido.id, estado: nuevo });
    },
    [cambiarEstado],
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <label className="flex items-center gap-2 text-sm">
          Estado:
          <select
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPedido | "")}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {etiquetaEstado(e)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {consulta.isPending ? (
        <SkeletonFilas />
      ) : consulta.isError ? (
        <EstadoError
          mensaje="No se pudieron cargar los pedidos."
          onReintentar={() => void consulta.refetch()}
        />
      ) : items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      ) : (
        <TablaPedidos
          pedidos={items}
          ocupado={cambiar.isPending}
          onDetalle={setDetalle}
          onCambiarEstado={handleCambiarEstado}
        />
      )}

      {detalle && (
        <DetallePedidoModal pedido={detalle} onClose={() => setDetalle(null)} />
      )}
    </section>
  );
}
