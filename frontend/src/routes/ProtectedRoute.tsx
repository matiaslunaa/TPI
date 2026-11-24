import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth/types/auth";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: Rol[];
}


export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  // checkSession todavía está confirmando la sesión con /auth/me
  if (cargando) {
    return (
      <div>
        <p className="mb-3 text-sm text-stone-600">Verificando sesión…</p>
        <SkeletonFilas filas={3} />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
