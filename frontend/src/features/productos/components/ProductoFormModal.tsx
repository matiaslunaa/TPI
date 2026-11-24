import { useForm } from "@tanstack/react-form";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import Campo from "@/shared/components/CampoForm";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import {
  useActualizarProducto,
  useCrearProducto,
} from "../hooks/useProductos";
import type { Producto, ProductoPayload } from "../types/producto";

interface Props {
  producto: Producto | null;
  onClose: () => void;
}

const numeroOVacio = (n: number): number | string => (Number.isNaN(n) ? "" : n);

export default function ProductoFormModal({ producto, onClose }: Props) {
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? "",
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    },
    onSubmit: async ({ value }) => {
      const payload: ProductoPayload = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: value.categoria_id,
      };
      try {
        if (producto) {
          await actualizar.mutateAsync({ id: producto.id, payload });
        } else {
          await crear.mutateAsync(payload);
        }
        onClose();
      } catch {
      }
    },
  });

  return (
    <Modal titulo={producto ? "Editar producto" : "Nuevo producto"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : "El nombre es obligatorio",
          }}
        >
          {(field) => (
            <Campo label="Nombre" field={field}>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <Campo label="Descripción" field={field}>
              <textarea
                id={field.name}
                rows={2}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Campo>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number.isNaN(value) || value < 0 ? "Debe ser 0 o mayor" : undefined,
            }}
          >
            {(field) => (
              <Campo label="Precio" field={field}>
                <Input
                  id={field.name}
                  type="number"
                  min={0}
                  step="0.01"
                  value={numeroOVacio(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                />
              </Campo>
            )}
          </form.Field>

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
                  value={numeroOVacio(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                />
              </Campo>
            )}
          </form.Field>
        </div>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) => (value > 0 ? undefined : "Elegí una categoría"),
          }}
        >
          {(field) => (
            <Campo label="Categoría" field={field}>
              <select
                id={field.name}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              >
                <option value={0}>Seleccionar…</option>
                {categorias.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          )}
        </form.Field>

        <form.Field name="imagen_url">
          {(field) => (
            <Campo label="URL de la imagen" field={field}>
              <Input
                id={field.name}
                placeholder="/img/mi-foto.jpg o https://…"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
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

        <div className="flex justify-end gap-2 pt-2">
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
