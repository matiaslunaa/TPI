import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { handleApiError } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedidos,
  getResumenPedidos,
} from "../api/pedidos";
import type {
  EstadoPedido,
  FiltrosPedidos,
  PedidoCreate,
} from "../types/pedido";

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ["pedidos-resumen"],
    queryFn: getResumenPedidos,
  });
}

// Crear o cancelar un pedido cambia el stock: se refrescan pedidos, resumen y catálogo.
function useInvalidarPedidos() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: (payload: PedidoCreate) => crearPedido(payload),
    onSuccess: () => {
      invalidar();
      notificar("¡Pedido confirmado!");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      invalidar();
      notificar("Estado del pedido actualizado");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos();
  const notificar = useNotificationStore((s) => s.notificar);
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      invalidar();
      notificar("Pedido cancelado");
    },
    onError: (e) => notificar(handleApiError(e), "error"),
  });
}
