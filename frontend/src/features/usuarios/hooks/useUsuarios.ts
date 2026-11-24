import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import {
  activarUsuario,
  desactivarUsuario,
  getUsuarios,
} from "../api/usuarios";

export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });
}

export function useActivarUsuario() {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: (id: number) => activarUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      notificar("Usuario activado");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: (id: number) => desactivarUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      notificar("Usuario desactivado");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}
