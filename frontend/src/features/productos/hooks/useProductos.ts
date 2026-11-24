import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from "../api/productos";
import type {
  FiltrosProductos,
  ProductoPayload,
  StockPayload,
} from "../types/producto";

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => getProductos(filtros),
    // Mantiene la página anterior mientras llega la nueva
    placeholderData: keepPreviousData,
  });
}

function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: (payload: ProductoPayload) => crearProducto(payload),
    onSuccess: () => {
      invalidar();
      notificar("Producto creado");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoPayload }) =>
      actualizarProducto(id, payload),
    onSuccess: () => {
      invalidar();
      notificar("Producto actualizado");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StockPayload }) =>
      actualizarStock(id, payload),
    onSuccess: () => {
      invalidar();
      notificar("Stock actualizado");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: () => {
      invalidar();
      notificar("Producto eliminado");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}
