import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useFavorites } from "@/lib/favorites";
import ProductCard from "@/components/product/ProductCard";

export default function Favorites() {
  const { slugs } = useFavorites();

  // One request for the whole catalog, then filtered client-side by saved slug.
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products", "all-for-favorites"],
    queryFn: () => apiGet<Product[]>("/catalog/products?limit=200"),
    enabled: slugs.length > 0,
  });

  const favorites = (products ?? []).filter((p) => slugs.includes(p.slug));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" data-testid="favorites-page">
      <h1 className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl">Meus Favoritos</h1>
      <p className="mt-2 text-xs text-stone-500" data-testid="favorites-count">
        {slugs.length === 0
          ? "Nenhuma peça salva ainda"
          : `${slugs.length} ${slugs.length === 1 ? "peça salva" : "peças salvas"}`}
      </p>

      {slugs.length === 0 ? (
        <div className="mt-12 border border-stone-200 bg-white p-12 text-center" data-testid="favorites-empty">
          <Heart className="mx-auto h-12 w-12 text-stone-300" />
          <h2 className="mt-5 font-heading text-2xl">Sua lista de desejos está vazia</h2>
          <p className="mt-3 text-sm text-stone-500">
            Toque no coração de qualquer peça para guardá-la aqui e comprar depois.
          </p>
          <Link
            to="/produtos"
            data-testid="favorites-empty-shop-button"
            className="mt-7 inline-block bg-foreground px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
          >
            Explorar produtos
          </Link>
        </div>
      ) : (
        <>
          {isError && (
            <div className="mt-8 border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
              Não foi possível carregar seus favoritos agora. Recarregue a página.
            </div>
          )}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: Math.min(slugs.length, 4) }, (_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] animate-pulse bg-stone-200/70" />
                    <div className="mt-3 h-3 w-3/4 animate-pulse bg-stone-200/70" />
                  </div>
                ))
              : favorites.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </>
      )}
    </div>
  );
}
