import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate } from "react-router-dom";
import Campo from "@/shared/components/CampoForm";
import { handleApiError } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { requestRegister } from "../api/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const login = useAuthStore((s) => s.login);
  const notificar = useNotificationStore((s) => s.notificar);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      confirmar: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await requestRegister({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim().toLowerCase(),
          password: value.password,
        });
        notificar("Cuenta creada. ¡Bienvenido!");
        await login(value.username.trim(), value.password);
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Crear cuenta</h1>

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
            onChange: ({ value }) => {
              const v = value.trim();
              if (v.length < 3) return "Mínimo 3 caracteres";
              if (v.length > 50) return "Máximo 50 caracteres";
              return undefined;
            },
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
          name="full_name"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : "Ingresá tu nombre completo",
          }}
        >
          {(field) => (
            <Campo label="Nombre completo" field={field}>
              <Input
                id={field.name}
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              EMAIL_REGEX.test(value.trim()) ? undefined : "Email inválido",
          }}
        >
          {(field) => (
            <Campo label="Email" field={field}>
              <Input
                id={field.name}
                type="email"
                autoComplete="email"
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
            onChange: ({ value }) =>
              value.length >= 8 ? undefined : "Mínimo 8 caracteres",
          }}
        >
          {(field) => (
            <Campo label="Contraseña" field={field}>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Campo>
          )}
        </form.Field>

        <form.Field
          name="confirmar"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) =>
              value === fieldApi.form.getFieldValue("password")
                ? undefined
                : "Las contraseñas no coinciden",
          }}
        >
          {(field) => (
            <Campo label="Repetir contraseña" field={field}>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
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
              {isSubmitting ? "Creando cuenta…" : "Registrarme"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Ingresá
        </Link>
      </p>
    </Card>
  );
}
