import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UsuarioPublic } from "@/features/auth/types/auth";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import TablaDatos from "@/shared/components/TablaDatos";
import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from "../hooks/useUsuarios";

export default function AdminUsuariosPage() {
  const consulta = useUsuarios();
  const miId = useAuthStore((s) => s.usuario?.id);
  const { mutate: activar } = useActivarUsuario();
  const { mutate: desactivar } = useDesactivarUsuario();

  const items = useMemo(() => consulta.data ?? [], [consulta.data]);

  const columns = useMemo<ColumnDef<UsuarioPublic, unknown>[]>(
    () => [
      {
        id: "username",
        header: "Usuario",
        cell: ({ row }) => <span className="font-semibold">{row.original.username}</span>,
      },
      { id: "nombre", header: "Nombre", cell: ({ row }) => row.original.full_name },
      { id: "email", header: "Email", cell: ({ row }) => row.original.email },
      { id: "rol", header: "Rol", cell: ({ row }) => row.original.role },
      {
        id: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              row.original.disabled
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {row.original.disabled ? "Desactivado" : "Activo"}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          if (u.disabled) {
            return (
              <Button size="sm" variant="outline" onClick={() => activar(u.id)}>
                Activar
              </Button>
            );
          }
          // El admin no puede desactivarse a sí mismo
          if (u.id === miId) return <span className="text-xs text-stone-500">(vos)</span>;
          return (
            <Button size="sm" variant="danger" onClick={() => desactivar(u.id)}>
              Desactivar
            </Button>
          );
        },
      },
    ],
    [activar, desactivar, miId],
  );

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      {consulta.isPending ? (
        <SkeletonFilas />
      ) : consulta.isError ? (
        <EstadoError
          mensaje="No se pudieron cargar los usuarios."
          onReintentar={() => void consulta.refetch()}
        />
      ) : items.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios." />
      ) : (
        <TablaDatos data={items} columns={columns} />
      )}
    </section>
  );
}
