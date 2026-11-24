import type { ReactNode } from "react";

interface EstadoVacioProps {
  mensaje: string;
  children?: ReactNode;
}

export default function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
      <p className="text-stone-600">{mensaje}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
