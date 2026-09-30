import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { NAV_LINKS } from "@/components/layout/navLinks";

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
}

export default function SearchOverlay({ open, onOpenChange, onSearch }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Live suggestions: only fires once there are 2+ characters.
  const { data: suggestions, isFetching } = useQuery({
    queryKey: ["search-suggestions", debounced],
    queryFn: () => apiGet<Product[]>(`/catalog/products?q=${encodeURIComponent(debounced)}&limit=5`),
    enabled: open && debounced.length >= 2,
    staleTime: 30_000,
  });

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    onOpenChange(false);
    onSearch(q);
  };

  const goTo = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogTitle className="font-heading text-xl">O que você procura?</DialogTitle>
        <form
          className="mt-4 flex items-center gap-2 border-b border-stone-300 pb-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Search className="h-4 w-4 shrink-0 text-stone-400" />
          <input
            data-testid="search-overlay-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vestido, jeans, bikini..."
            autoFocus
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
          <button
            type="submit"
            data-testid="search-overlay-submit-button"
            className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-800 transition-colors hover:text-brand"
          >
            Buscar
          </button>
        </form>

        {/* Live product suggestions */}
        {debounced.length >= 2 && (
          <div className="mt-4" data-testid="search-overlay-suggestions">
            {isFetching && !suggestions ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-16 w-12 animate-pulse bg-stone-200/70" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-3/4 animate-pulse bg-stone-200/70" />
                      <div className="h-3 w-1/3 animate-pulse bg-stone-200/70" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions && suggestions.length > 0 ? (
              <div className="space-y-1">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    data-testid={`search-suggestion-${product.slug}`}
                    onClick={() => goTo(`/produto/${product.slug}`)}
                    className="flex w-full items-center gap-3 p-1.5 text-left transition-colors hover:bg-stone-50"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-16 w-12 shrink-0 object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 block text-xs font-medium uppercase tracking-wide">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-xs text-stone-500">{formatBRL(product.price)}</span>
                    </span>
                  </button>
                ))}
                <button
                  data-testid="search-overlay-see-all-button"
                  onClick={submit}
                  className="mt-2 w-full border border-stone-200 py-2 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors hover:border-foreground"
                >
                  Ver todos os resultados
                </button>
              </div>
            ) : (
              <p className="py-3 text-xs text-stone-500" data-testid="search-overlay-no-results">
                Nenhum produto encontrado para “{debounced}”.
              </p>
            )}
          </div>
        )}

        {/* Popular categories (hidden while showing suggestions) */}
        {debounced.length < 2 && (
          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-500">
              Buscas populares
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.to}
                  data-testid={`search-overlay-suggestion-${link.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  onClick={() => goTo(link.to)}
                  className="border border-stone-200 px-3 py-1.5 text-xs uppercase tracking-wide text-stone-700 transition-colors hover:border-brand hover:text-brand"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
