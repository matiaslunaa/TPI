import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  requestLogin,
  requestLogout,
  requestMe,
} from "@/features/auth/api/auth";
import type { UsuarioPublic, UsuarioSesion } from "@/features/auth/types/auth";
import { setSesionInvalidaHandler } from "@/shared/api/axiosInstance";

interface AuthState {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

function aSesion(u: UsuarioPublic): UsuarioSesion {
  return {
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    email: u.email,
    role: u.role,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await requestLogin(username, password);
        const me = await requestMe();
        set({ usuario: aSesion(me) });
      },

      logout: async () => {
        try {
          await requestLogout();
        } finally {
          set({ usuario: null });
        }
      },

      checkSession: async () => {
        try {
          const me = await requestMe();
          set({ usuario: aSesion(me) });
        } catch {
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },
    }),
    {
      name: "foodstore-auth",
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

// ante un 401 se limpia la sesión
setSesionInvalidaHandler(() => {
  useAuthStore.setState({ usuario: null });
});
