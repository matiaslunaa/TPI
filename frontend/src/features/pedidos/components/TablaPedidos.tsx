import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TablaDatos from "@/shared/components/TablaDatos";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import { formatFecha, formatPrecio } from "@/shared/utils/format";
import { TRANSICIONES, type EstadoPedido, type Pedido } from "../types/pedido";

interface Props {
  pedidos: Pedido[];
  ocupado: boolean;
  onDetalle: (pedido: Pedido) => void;
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
}

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Preparar",
  ENTREGADO: "Entregar",
  CANCELADO: "Cancelar",
};

// Tabla de pedidos del panel admin
export default function TablaPedidos({
  pedidos,
  ocupado,
  onDetalle,
  onCambiarEstado,
}: Props) {
  const columns = useMemo<ColumnDef<Pedido, unknown>[]>(
    () => [
      { id: "id", header: "#", cell: ({ row }) => row.original.id },
      { id: "cliente", header: "Cliente (id)", cell: ({ row }) => row.original.usuario_id },
      { id: "fecha", header: "Fecha", cell: ({ row }) => formatFecha(row.original.created_at) },
      {
        id: "estado",
        header: "Estado",
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      { id: "pago", header: "Pago", cell: ({ row }) => row.original.forma_pago },
      {
        id: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-semibold">{formatPrecio(row.original.total)}</span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const pedido = row.original;
          return (
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" onClick={() => onDetalle(pedido)}>
                Detalle
              </Button>
              {TRANSICIONES[pedido.estado].map((siguiente) => (
                <Button
                  key={siguiente}
                  size="sm"
                  variant={siguiente === "CANCELADO" ? "danger" : "primary"}
                  disabled={ocupado}
                  onClick={() => onCambiarEstado(pedido, siguiente)}
                >
                  {ETIQUETA_ACCION[siguiente]}
                </Button>
              ))}
            </div>
          );
        },
      },
    ],
    [ocupado, onDetalle, onCambiarEstado],
  );

  return <TablaDatos data={pedidos} columns={columns} />;
}
