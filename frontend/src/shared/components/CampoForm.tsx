import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";

export function ErrorCampo({ field }: { field: AnyFieldApi }) {
  const errores = field.state.meta.errors
    .filter((e) => Boolean(e))
    .map((e) =>
      typeof e === "string" ? e : String((e as { message?: string }).message ?? e),
    );
  if (!field.state.meta.isTouched || errores.length === 0) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-error">
      {errores.join(". ")}
    </p>
  );
}

interface CampoProps {
  label: string;
  field: AnyFieldApi;
  children: ReactNode;
}

export default function Campo({ label, field, children }: CampoProps) {
  return (
    <div>
      <label
        htmlFor={field.name}
        className="mb-1 block text-sm font-medium text-stone-700"
      >
        {label}
      </label>
      {children}
      <ErrorCampo field={field} />
    </div>
  );
}
