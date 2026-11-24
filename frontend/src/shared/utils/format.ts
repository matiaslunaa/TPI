const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

export function formatPrecio(valor: number): string {
  return moneda.format(valor);
}

export function formatFecha(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function etiquetaEstado(estado: string): string {
  return estado.replace("_", " ");
}
