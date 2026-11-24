import { useForm } from "@tanstack/react-form";
import Campo from "@/shared/components/CampoForm";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import { useActualizarStock } from "../hooks/useProductos";
import type { Producto } from "../types/producto";

interface Props {
  producto: Producto;
  onClose: () => void;
}

export default function StockModal({ producto, onClose }: Props) {
  const actualizar = useActualizarStock();

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      try {
        await actualizar.mutateAsync({
          id: producto.id,
          payload: { stock: value.stock, disponible: value.disponible },
        });
        onClose();
      } catch {
      }
    },
  });

  return (
    <Modal titulo={`Stock: ${producto.nombre}`} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number.isInteger(value) && value >= 0
                ? undefined
                : "Debe ser un entero 0 o mayor",
          }}
        >
          {(field) => (
            <Campo label="Stock" field={field}>
              <Input
                id={field.name}
                type="number"
                min={0}
                step="1"
                value={Number.isNaN(field.state.value) ? "" : field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando…" : "Guardar"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}
