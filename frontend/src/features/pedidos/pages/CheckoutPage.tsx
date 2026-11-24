import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import Campo from "@/shared/components/CampoForm";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import type { FormaPago } from "../types/pedido";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await crearPedido.mutateAsync({
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        });
        vaciar();
        navigate("/mis-pedidos");
      } catch {
      }
    },
  });

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="No hay productos en el carrito para confirmar.">
        <Link to="/" className="font-semibold text-brand hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="direccion_entrega"
            validators={{
              onChange: ({ value }) => {
                const n = value.trim().length;
                if (n < 5) return "Mínimo 5 caracteres";
                if (n > 200) return "Máximo 200 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Campo label="Dirección de entrega" field={field}>
                <Input
                  id={field.name}
                  autoComplete="street-address"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Campo>
            )}
          </form.Field>

          <form.Field name="forma_pago">
            {(field) => (
              <Campo label="Forma de pago" field={field}>
                <select
                  id={field.name}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </Campo>
            )}
          </form.Field>

          <form.Field name="notas">
            {(field) => (
              <Campo label="Notas (opcional)" field={field}>
                <textarea
                  id={field.name}
                  rows={3}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Campo>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando…" : "Confirmar pedido"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <Card className="h-fit p-6">
        <h2 className="mb-3 text-lg font-bold">Resumen</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between py-2">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-lg font-extrabold">
          Total: {formatPrecio(total)}
        </p>
      </Card>
    </section>
  );
}
