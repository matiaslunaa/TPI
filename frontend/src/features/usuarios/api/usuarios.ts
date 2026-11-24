import { api } from "@/shared/api/axiosInstance";
import type { UsuarioPublic } from "@/features/auth/types/auth";

export async function getUsuarios(): Promise<UsuarioPublic[]> {
  const { data } = await api.get<UsuarioPublic[]>("/admin/usuarios");
  return data;
}

export async function activarUsuario(id: number): Promise<UsuarioPublic> {
  const { data } = await api.post<UsuarioPublic>(`/admin/usuarios/${id}/activar`);
  return data;
}

export async function desactivarUsuario(id: number): Promise<UsuarioPublic> {
  const { data } = await api.post<UsuarioPublic>(
    `/admin/usuarios/${id}/desactivar`,
  );
  return data;
}
