import axios, { type AxiosError } from "axios";

// withCredentials hace que el navegador envíe y reciba la cookie HttpOnly con el JWT: el frontend nunca ve el token.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 10000,
  withCredentials: true,
});

// El authStore registra acá qué hacer cuando la sesión deja de ser válida.
// Así axiosInstance no importa el store.
let onSesionInvalida: (() => void) | null = null;

export function setSesionInvalidaHandler(handler: () => void): void {
  onSesionInvalida = handler;
}

const RUTAS_DE_AUTH = ["/auth/token", "/auth/me"];

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const url = error.config?.url ?? "";
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));

    const sesionVencida = status === 401 && !esDeAuth;
    const cuentaDesactivada =
      status === 400 && detail === "Cuenta de usuario desactivada";

    // Se limpia el authStore; ProtectedRoute lleva a /login al quedar sin usuario
    if (sesionVencida || cuentaDesactivada) {
      onSesionInvalida?.();
    }
    return Promise.reject(error);
  },
);
