import { useState } from "react";
import { Link } from "react-router-dom";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatFecha, formatPrecio } from "@/shared/utils/format";
import DetallePedidoModal from "../components/DetallePedidoModal";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types/pedido";

const LIMIT = 5;

export default function MisPedidosPage() {
  const [page, setPage] = useState(0);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const consulta = usePedidos({ skip: page * LIMIT, limit: LIMIT });
  const cancelar = useCancelarPedido();

  const totalPages = Math.ceil((consulta.data?.total ?? 0) / LIMIT);

  const handleCancelar = (pedido: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) {
      cancelar.mutate(pedido.id);
    }
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>

      {consulta.isPending ? (
        <SkeletonFilas filas={4} />
      ) : consulta.isError ? (
        <EstadoError
          mensaje="No se pudieron cargar tus pedidos."
          onReintentar={() => void consulta.refetch()}
        />
      ) : consulta.data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste ningún pedido.">
          <Link to="/" className="font-semibold text-brand hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      ) : (
        <>
          <div className="space-y-3">
            {consulta.data.items.map((pedido) => (
              <Card key={pedido.id} className="flex flex-wrap items-center gap-4">
                <div className="min-w-40 flex-1">
                  <p className="font-bold">Pedido #{pedido.id}</p>
                  <p className="text-sm text-stone-500">{formatFecha(pedido.created_at)}</p>
                </div>
                <BadgeEstado estado={pedido.estado} />
                <p className="w-28 text-right font-bold">{formatPrecio(pedido.total)}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDetalle(pedido)}>
                    Ver detalle
                  </Button>
                  {pedido.estado === "PENDIENTE" && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={cancelar.isPending}
                      onClick={() => handleCancelar(pedido)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Paginacion page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {detalle && (
        <DetallePedidoModal pedido={detalle} onClose={() => setDetalle(null)} />
      )}
    </section>
  );
}
