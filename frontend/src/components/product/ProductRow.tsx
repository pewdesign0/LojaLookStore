import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

interface ProductRowProps {
  eyebrow?: string;
  title: string;
  products: Product[];
  isLoading?: boolean;
  cta?: { label: string; to: string };
}

function SkeletonCard() {
  return (
    <div className="w-[220px] flex-none sm:w-[262px]">
      <div className="aspect-[3/4] animate-pulse bg-stone-200/70" />
      <div className="mt-3 h-3 w-3/4 animate-pulse bg-stone-200/70" />
      <div className="mt-2 h-3 w-1/2 animate-pulse bg-stone-200/70" />
    </div>
  );
}

export default function ProductRow({ eyebrow, title, products, isLoading, cta }: ProductRowProps) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    scroller.current?.scrollBy({ left: direction * 560, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" data-testid="product-row">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand">{eyebrow}</p>}
          <h2 className="mt-1 text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl">{title}</h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            data-testid="product-row-previous-button"
            aria-label="Produtos anteriores"
            onClick={() => scroll(-1)}
            className="border border-stone-200 p-2 transition-colors hover:border-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            data-testid="product-row-next-button"
            aria-label="Próximos produtos"
            onClick={() => scroll(1)}
            className="border border-stone-200 p-2 transition-colors hover:border-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-6">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
          : products.map((product) => (
              <div key={product.id} className="w-[220px] flex-none snap-start sm:w-[262px]">
                <ProductCard product={product} />
              </div>
            ))}
        {cta && !isLoading && products.length > 0 && (
          <div className="flex w-[220px] flex-none items-center justify-center sm:w-[262px]">
            <Link
              to={cta.to}
              data-testid={`product-row-cta-${cta.to.replace(/\//g, "-")}`}
              className="border border-foreground px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors hover:bg-foreground hover:text-white"
            >
              {cta.label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
