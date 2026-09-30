import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function CategoryTiles() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<Category[]>("/catalog/categories"),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" data-testid="category-tiles">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4 lg:grid-cols-8">
        {(categories ?? []).map((category) => (
          <Link
            key={category.slug}
            to={`/categoria/${category.slug}`}
            data-testid={`category-tile-${category.slug}`}
            className="group relative block aspect-[3/4] overflow-hidden bg-muted"
          >
            <img
              src={category.image}
              alt={`Categoria ${category.name}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
                {category.name}
              </p>
            </div>
          </Link>
        ))}
        {!categories && Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-[3/4] animate-pulse bg-stone-200/70" />)}
      </div>
    </section>
  );
}
