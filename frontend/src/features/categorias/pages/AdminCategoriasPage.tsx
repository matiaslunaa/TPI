import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import TablaDatos from "@/shared/components/TablaDatos";
import Button from "@/shared/ui/Button";
import CategoriaFormModal from "../components/CategoriaFormModal";
import { useCategorias, useEliminarCategoria } from "../hooks/useCategorias";
import type { Categoria } from "../types/categoria";

export default function AdminCategoriasPage() {
  const consulta = useCategorias();
  const eliminar = useEliminarCategoria();
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [creando, setCreando] = useState(false);

  const items = useMemo(() => consulta.data ?? [], [consulta.data]);
  const { mutate: eliminarCategoria } = eliminar;

  const columns = useMemo<ColumnDef<Categoria, unknown>[]>(
    () => [
      { id: "id", header: "#", cell: ({ row }) => row.original.id },
      {
        id: "nombre",
        header: "Nombre",
        cell: ({ row }) => <span className="font-semibold">{row.original.nombre}</span>,
      },
      {
        id: "descripcion",
        header: "Descripción",
        cell: ({ row }) => row.original.descripcion ?? "—",
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setEditando(row.original)}>
              Editar
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    `¿Eliminar la categoría "${row.original.nombre}"? Sus productos no se dan de baja automáticamente.`,
                  )
                ) {
                  eliminarCategoria(row.original.id);
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [eliminarCategoria],
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => setCreando(true)}>+ Nueva categoría</Button>
      </div>

      {consulta.isPending ? (
        <SkeletonFilas />
      ) : consulta.isError ? (
        <EstadoError
          mensaje="No se pudieron cargar las categorías."
          onReintentar={() => void consulta.refetch()}
        />
      ) : items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay categorías." />
      ) : (
        <TablaDatos data={items} columns={columns} />
      )}

      {creando && (
        <CategoriaFormModal categoria={null} onClose={() => setCreando(false)} />
      )}
      {editando && (
        <CategoriaFormModal categoria={editando} onClose={() => setEditando(null)} />
      )}
    </section>
  );
}
