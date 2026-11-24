import { api } from "@/shared/api/axiosInstance";
import type { RegisterPayload, UsuarioPublic } from "../types/auth";

export async function requestLogin(
  username: string,
  password: string,
): Promise<void> {
  const body = new URLSearchParams({ username, password });
  await api.post("/auth/token", body);
}

export async function requestMe(): Promise<UsuarioPublic> {
  const { data } = await api.get<UsuarioPublic>("/auth/me");
  return data;
}

export async function requestLogout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function requestRegister(
  payload: RegisterPayload,
): Promise<UsuarioPublic> {
  const { data } = await api.post<UsuarioPublic>("/auth/register", payload);
  return data;
}
