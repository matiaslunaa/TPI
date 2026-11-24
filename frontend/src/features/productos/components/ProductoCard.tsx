import type { Producto } from "../types/producto";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";

export default function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );
  const notificar = useNotificationStore((s) => s.notificar);

  const sinStock = producto.stock <= 0;
  const noVendible = !producto.disponible || sinStock;
  const tope = enCarrito >= producto.stock;

  const handleAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    });
    notificar(`${producto.nombre} agregado al carrito`);
  };

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className="flex h-40 items-center justify-center bg-stone-100 text-5xl">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span aria-hidden="true">🍽️</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {producto.categoria && (
          <span className="mb-1 text-xs font-semibold uppercase text-brand">
            {producto.categoria.nombre}
          </span>
        )}
        <h3 className="font-bold">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-600">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-extrabold">
            {formatPrecio(producto.precio_base)}
          </span>
          <span
            className={`text-xs font-semibold ${
              noVendible ? "text-error" : "text-stone-500"
            }`}
          >
            {!producto.disponible
              ? "No disponible"
              : sinStock
                ? "Sin stock"
                : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button
          className="mt-4 w-full"
          disabled={noVendible || tope}
          onClick={handleAgregar}
        >
          {tope && !noVendible ? "Máximo en carrito" : "Agregar al carrito"}
        </Button>
      </div>
    </Card>
  );
}
