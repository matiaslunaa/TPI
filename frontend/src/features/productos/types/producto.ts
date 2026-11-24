import type { Categoria } from "@/features/categorias/types/categoria";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria | null;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export interface ProductoPayload {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export interface StockPayload {
  stock: number;
  disponible: boolean;
}

export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
