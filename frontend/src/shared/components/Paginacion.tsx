import Button from "@/shared/ui/Button";

interface PaginacionProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Paginacion({ page, totalPages, onChange }: PaginacionProps) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Paginación"
      className="mt-6 flex items-center justify-center gap-3"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ← Anterior
      </Button>
      <span className="text-sm text-stone-600">
        Página {page + 1} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Siguiente →
      </Button>
    </nav>
  );
}
