import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  getCategorias,
} from "../api/categorias";
import type { CategoriaPayload } from "../types/categoria";

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });
}

function useInvalidarCategorias() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["categorias"] });
    // Los productos incluyen su categoría: también se refrescan
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCategorias();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: (payload: CategoriaPayload) => crearCategoria(payload),
    onSuccess: () => {
      invalidar();
      notificar("Categoría creada");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCategorias();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaPayload }) =>
      actualizarCategoria(id, payload),
    onSuccess: () => {
      invalidar();
      notificar("Categoría actualizada");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCategorias();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => {
      invalidar();
      notificar("Categoría eliminada");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}
