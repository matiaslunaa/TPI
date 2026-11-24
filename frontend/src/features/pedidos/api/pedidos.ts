import { api } from "@/shared/api/axiosInstance";
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido";

export async function getPedidos(
  filtros: FiltrosPedidos,
): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>("/pedidos", {
    params: {
      skip: filtros.skip,
      limit: filtros.limit,
      estado: filtros.estado,
    },
  });
  return data;
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}

export async function crearPedido(payload: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>("/pedidos", payload);
  return data;
}

export async function cambiarEstadoPedido(
  id: number,
  estado: EstadoPedido,
): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}
