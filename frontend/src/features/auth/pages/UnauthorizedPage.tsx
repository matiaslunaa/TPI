import { Link } from "react-router-dom";
import EstadoVacio from "@/shared/components/EstadoVacio";

export default function UnauthorizedPage() {
  return (
    <EstadoVacio mensaje="No tenés permiso para ver esta pantalla.">
      <Link to="/" className="font-semibold text-brand hover:underline">
        Volver al inicio
      </Link>
    </EstadoVacio>
  );
}
