import { create } from "zustand";

export type TipoNotificacion = "exito" | "error";

interface NotificationState {
  mensaje: string | null;
  tipo: TipoNotificacion;
  notificar: (mensaje: string, tipo?: TipoNotificacion) => void;
  cerrar: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useNotificationStore = create<NotificationState>()((set) => ({
  mensaje: null,
  tipo: "exito",
  notificar: (mensaje, tipo = "exito") => {
    if (timer) clearTimeout(timer);
    set({ mensaje, tipo });
    timer = setTimeout(() => set({ mensaje: null }), 4000);
  },
  cerrar: () => set({ mensaje: null }),
}));
