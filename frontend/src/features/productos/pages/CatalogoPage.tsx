import { useState, type FormEvent } from "react";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import { SkeletonCard } from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const LIMIT = 8;

export default function CatalogoPage() {
  const [page, setPage] = useState(0);
  const [texto, setTexto] = useState("");
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const productos = useProductos({
    skip: page * LIMIT,
    limit: LIMIT,
    search,
    categoria_id: categoriaId,
  });
  const categorias = useCategorias();

  const totalPages = Math.ceil((productos.data?.total ?? 0) / LIMIT);

  const handleBuscar = (e: FormEvent) => {
    e.preventDefault();
    setSearch(texto.trim());
    setPage(0);
  };

  const elegirCategoria = (id: number | undefined) => {
    setCategoriaId(id);
    setPage(0);
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>

      <form onSubmit={handleBuscar} className="mb-4 flex gap-2">
        <Input
          type="search"
          placeholder="Buscar por nombre…"
          aria-label="Buscar productos"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Button type="submit">Buscar</Button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={categoriaId === undefined ? "primary" : "outline"}
          onClick={() => elegirCategoria(undefined)}
        >
          Todas
        </Button>
        {categorias.data?.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={categoriaId === c.id ? "primary" : "outline"}
            onClick={() => elegirCategoria(c.id)}
          >
            {c.nombre}
          </Button>
        ))}
      </div>

      {productos.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMIT }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje="No se pudo cargar el catálogo."
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No encontramos productos con esos filtros." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </section>
  );
}
