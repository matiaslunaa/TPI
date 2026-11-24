import { useForm } from "@tanstack/react-form";
import Campo from "@/shared/components/CampoForm";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import {
  useActualizarCategoria,
  useCrearCategoria,
} from "../hooks/useCategorias";
import type { Categoria, CategoriaPayload } from "../types/categoria";

interface Props {
  categoria: Categoria | null;
  onClose: () => void;
}

export default function CategoriaFormModal({ categoria, onClose }: Props) {
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();

  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      const payload: CategoriaPayload = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      };
      try {
        if (categoria) {
          await actualizar.mutateAsync({ id: categoria.id, payload });
        } else {
          await crear.mutateAsync(payload);
        }
        onClose();
      } catch {
      }
    },
  });

  return (
    <Modal titulo={categoria ? "Editar categoría" : "Nueva categoría"} onClose={onClose}>
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
            onChange: ({ value }) => {
              const n = value.trim().length;
              if (n < 2) return "Mínimo 2 caracteres";
              if (n > 100) return "Máximo 100 caracteres";
              return undefined;
            },
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
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Campo>
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
