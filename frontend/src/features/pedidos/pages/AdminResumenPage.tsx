import EstadoError from "@/shared/components/EstadoError";
import Skeleton from "@/shared/components/Skeleton";
import { formatPrecio } from "@/shared/utils/format";
import TarjetaResumen from "../components/TarjetaResumen";
import { useResumenPedidos } from "../hooks/usePedidos";

export default function AdminResumenPage() {
  const consulta = useResumenPedidos();

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Resumen del negocio</h1>

      {consulta.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : consulta.isError ? (
        <EstadoError
          mensaje="No se pudo cargar el resumen."
          onReintentar={() => void consulta.refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={consulta.data.pendientes} color="text-amber-600" />
          <TarjetaResumen titulo="En preparación" valor={consulta.data.en_preparacion} color="text-blue-600" />
          <TarjetaResumen titulo="Entregados" valor={consulta.data.entregados} color="text-green-600" />
          <TarjetaResumen titulo="Cancelados" valor={consulta.data.cancelados} color="text-red-600" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={consulta.data.pedidos_hoy} />
          <TarjetaResumen
            titulo="Ingresos (entregados)"
            valor={formatPrecio(consulta.data.ingresos_entregados)}
            color="text-brand"
          />
        </div>
      )}
    </section>
  );
}
