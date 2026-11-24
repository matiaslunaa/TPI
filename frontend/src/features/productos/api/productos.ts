import { api } from "@/shared/api/axiosInstance";
import type {
  FiltrosProductos,
  Producto,
  ProductoPayload,
  ProductosPaginados,
  StockPayload,
} from "../types/producto";

export async function getProductos(
  filtros: FiltrosProductos,
): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>("/productos", {
    params: {
      skip: filtros.skip,
      limit: filtros.limit,
      search: filtros.search || undefined,
      categoria_id: filtros.categoria_id,
      disponible: filtros.disponible,
    },
  });
  return data;
}

export async function crearProducto(
  payload: ProductoPayload,
): Promise<Producto> {
  const { data } = await api.post<Producto>("/productos", payload);
  return data;
}

export async function actualizarProducto(
  id: number,
  payload: ProductoPayload,
): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, payload);
  return data;
}

export async function actualizarStock(
  id: number,
  payload: StockPayload,
): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, payload);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
