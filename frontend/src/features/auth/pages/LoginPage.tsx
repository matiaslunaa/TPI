import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useLocation } from "react-router-dom";
import Campo from "@/shared/components/CampoForm";
import { handleApiError } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const login = useAuthStore((s) => s.login);
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const desde = (location.state as LocationState | null)?.from?.pathname ?? "/";

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username.trim(), value.password);
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });

  if (usuario) return <Navigate to={desde} replace />;

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Iniciar sesión</h1>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : "Ingresá tu usuario",
          }}
        >
          {(field) => (
            <Campo label="Usuario" field={field}>
              <Input
                id={field.name}
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (value ? undefined : "Ingresá tu contraseña"),
          }}
        >
          {(field) => (
            <Campo label="Contraseña" field={field}>
              <Input
                id={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Campo>
          )}
        </form.Field>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando…" : "Ingresar"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-sm text-stone-600">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="font-semibold text-brand hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  );
}
