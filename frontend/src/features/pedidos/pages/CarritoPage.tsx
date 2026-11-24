import { Link, useNavigate } from "react-router-dom";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const quitar = useCartStore((s) => s.quitar);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="Tu carrito está vacío.">
        <Link to="/" className="font-semibold text-brand hover:underline">
          Ver el catálogo
        </Link>
      </EstadoVacio>
    );
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.producto_id} className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-stone-100 text-2xl">
              {item.imagen_url ? (
                <img
                  src={item.imagen_url}
                  alt={item.nombre}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span aria-hidden="true">🍽️</span>
              )}
            </div>

            <div className="min-w-40 flex-1">
              <p className="font-semibold">{item.nombre}</p>
              <p className="text-sm text-stone-600">{formatPrecio(item.precio_unitario)} c/u</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                aria-label={`Quitar una unidad de ${item.nombre}`}
                disabled={item.cantidad <= 1}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center font-semibold">{item.cantidad}</span>
              <Button
                size="sm"
                variant="outline"
                aria-label={`Agregar una unidad de ${item.nombre}`}
                disabled={item.cantidad >= item.stock}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>

            <p className="w-28 text-right font-bold">
              {formatPrecio(item.precio_unitario * item.cantidad)}
            </p>

            <Button size="sm" variant="danger" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </Card>
        ))}
      </div>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xl font-extrabold">Total: {formatPrecio(total)}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={vaciar}>
            Vaciar carrito
          </Button>
          <Button onClick={() => navigate("/checkout")}>Confirmar pedido</Button>
        </div>
      </Card>
    </section>
  );
}
