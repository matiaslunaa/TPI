import { Link, NavLink, useNavigate } from "react-router-dom";
import { queryClient } from "@/shared/api/queryClient";
import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
    isActive ? "bg-brand/10 text-brand" : "text-stone-700 hover:bg-stone-100"
  }`;

export default function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.cantidadTotal());
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate("/login");
  };

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="mr-4 text-xl font-extrabold text-brand">
          Food Store
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito{cantidad > 0 ? ` (${cantidad})` : ""}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === "admin" && (
            <NavLink to="/admin/resumen" className={claseLink}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-stone-700">
                {usuario.full_name}{" "}
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold uppercase text-stone-600">
                  {usuario.role}
                </span>
              </span>
              <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseLink}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>

      {usuario?.role === "admin" && (
        <div className="border-t border-stone-100 bg-stone-50">
          <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-1.5">
            <NavLink to="/admin/resumen" className={claseLink}>
              Resumen
            </NavLink>
            <NavLink to="/admin/categorias" className={claseLink}>
              Categorías
            </NavLink>
            <NavLink to="/admin/productos" className={claseLink}>
              Productos
            </NavLink>
            <NavLink to="/admin/pedidos" className={claseLink}>
              Pedidos
            </NavLink>
            <NavLink to="/admin/usuarios" className={claseLink}>
              Usuarios
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
