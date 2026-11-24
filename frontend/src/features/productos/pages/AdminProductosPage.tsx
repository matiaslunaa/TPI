import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import TablaDatos from "@/shared/components/TablaDatos";
import Button from "@/shared/ui/Button";
import { formatPrecio } from "@/shared/utils/format";
import ProductoFormModal from "../components/ProductoFormModal";
import StockModal from "../components/StockModal";
import { useEliminarProducto, useProductos } from "../hooks/useProductos";
import type { Producto } from "../types/producto";

export default function AdminProductosPage() {
  const consulta = useProductos({ skip: 0, limit: 100 });
  const eliminar = useEliminarProducto();

  const [editando, setEditando] = useState<Producto | null>(null);
  const [creando, setCreando] = useState(false);
  const [stockDe, setStockDe] = useState<Producto | null>(null);

  const items = useMemo(() => consulta.data?.items ?? [], [consulta.data]);
  const { mutate: eliminarProducto } = eliminar;

  const columns = useMemo<ColumnDef<Producto, unknown>[]>(
    () => [
      {
        id: "imagen",
        header: "",
        cell: ({ row }) =>
          row.original.imagen_url ? (
            <img
              src={row.original.imagen_url}
              alt=""
              className="h-10 w-10 rounded object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
          ) : (
            <span aria-hidden="true">🍽️</span>
          ),
      },
      {
        id: "nombre",
        header: "Nombre",
        cell: ({ row }) => <span className="font-semibold">{row.original.nombre}</span>,
      },
      {
        id: "categoria",
        header: "Categoría",
        cell: ({ row }) => row.original.categoria?.nombre ?? "—",
      },
      {
        id: "precio",
        header: "Precio",
        cell: ({ row }) => formatPrecio(row.original.precio_base),
      },
      { id: "stock", header: "Stock", cell: ({ row }) => row.original.stock },
      {
        id: "disponible",
        header: "Disponible",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              row.original.disponible
                ? "bg-green-100 text-green-800"
                : "bg-stone-200 text-stone-700"
            }`}
          >
            {row.original.disponible ? "Sí" : "No"}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" onClick={() => setEditando(row.original)}>
              Editar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setStockDe(row.original)}>
              Stock
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (window.confirm(`¿Eliminar "${row.original.nombre}"?`)) {
                  eliminarProducto(row.original.id);
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [eliminarProducto],
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setCreando(true)}>+ Nuevo producto</Button>
      </div>

      {consulta.isPending ? (
        <SkeletonFilas />
      ) : consulta.isError ? (
        <EstadoError
          mensaje="No se pudieron cargar los productos."
          onReintentar={() => void consulta.refetch()}
        />
      ) : items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay productos." />
      ) : (
        <TablaDatos data={items} columns={columns} />
      )}

      {creando && (
        <ProductoFormModal producto={null} onClose={() => setCreando(false)} />
      )}
      {editando && (
        <ProductoFormModal producto={editando} onClose={() => setEditando(null)} />
      )}
      {stockDe && <StockModal producto={stockDe} onClose={() => setStockDe(null)} />}
    </section>
  );
}
