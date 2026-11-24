import axios from "axios";

interface ApiErrorDetalle {
  msg?: string;
}

export function extraerDetalle(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as { detail?: unknown } | undefined;
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const msgs = (detail as ApiErrorDetalle[])
      .map((d) => d.msg)
      .filter((m): m is string => Boolean(m));
    if (msgs.length > 0) return msgs.join(". ");
  }
  return null;
}

export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) return "Error inesperado.";
  if (error.code === "ECONNABORTED") {
    return "El servidor tardó demasiado en responder.";
  }
  if (!error.response) return "No se pudo conectar con el servidor.";

  const { status } = error.response;
  const detalle = extraerDetalle(error);
  if (detalle) return detalle;
  if (status === 401) return "La sesión venció. Iniciá sesión de nuevo.";
  if (status === 403) return "No tenés permisos para realizar esta acción.";
  if (status === 422) return "Los datos enviados no son válidos.";
  if (status < 500) return "No se pudo completar la operación.";
  return "Error del servidor. Intentá nuevamente más tarde.";
}
