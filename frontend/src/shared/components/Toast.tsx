import { useNotificationStore } from "@/store/notificationStore";

export default function Toast() {
  const mensaje = useNotificationStore((s) => s.mensaje);
  const tipo = useNotificationStore((s) => s.tipo);
  const cerrar = useNotificationStore((s) => s.cerrar);

  if (!mensaje) return null;
  const color = tipo === "error" ? "bg-red-600" : "bg-green-600";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${color}`}
    >
      <span>{mensaje}</span>
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar notificación"
        className="text-lg leading-none opacity-80 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
