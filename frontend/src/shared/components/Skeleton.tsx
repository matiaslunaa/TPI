interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-stone-200 ${className}`}
    />
  );
}

// Esqueleto de una tarjeta de producto del catálogo.
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <Skeleton className="mb-3 h-36 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-4 h-3 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

// Esqueleto de filas de tabla / lista.
export function SkeletonFilas({ filas = 5 }: { filas?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
