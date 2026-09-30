import { useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import ProductCard from "@/components/product/ProductCard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SORT_LABELS: Record<string, string> = {
  relevance: "Mais Vendidos",
  newest: "Lançamentos",
  price_asc: "Menor Preço",
  price_desc: "Maior Preço",
};

const PRICE_RANGES = [
  { label: "Até R$ 200", max: 200 },
  { label: "Até R$ 400", max: 400 },
  { label: "Até R$ 600", max: 600 },
];

const PSEUDO_TITLES: Record<string, string> = {
  novidades: "Novidades",
  outlet: "Outlet 50% OFF",
};

function FilterPanel({
  products,
  selectedSizes,
  toggleSize,
  selectedColors,
  toggleColor,
  selectedLines,
  toggleLine,
  priceMax,
  setPriceMax,
}: {
  products: Product[];
  selectedSizes: string[];
  toggleSize: (size: string) => void;
  selectedColors: string[];
  toggleColor: (color: string) => void;
  selectedLines: string[];
  toggleLine: (line: string) => void;
  priceMax: number | null;
  setPriceMax: (value: number | null) => void;
}) {
  const sizes = [...new Set(products.flatMap((p) => p.sizes.map((s) => s.size)))];
  const colors = [...new Set(products.flatMap((p) => p.colors.map((c) => c.name)))];
  const lines = [...new Set(products.map((p) => p.line))];

  return (
    <div className="space-y-6" data-testid="catalog-filters">
      <FilterGroup title="Tamanho">
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              data-testid={`filter-size-${size.toLowerCase()}`}
              onClick={() => toggleSize(size)}
              className={`min-w-9 border px-2 py-1.5 text-xs transition-colors ${
                selectedSizes.includes(size)
                  ? "border-foreground bg-foreground text-white"
                  : "border-stone-300 hover:border-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Cor">
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              data-testid={`filter-color-${color.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              onClick={() => toggleColor(color)}
              className={`border px-2.5 py-1.5 text-xs transition-colors ${
                selectedColors.includes(color)
                  ? "border-foreground bg-foreground text-white"
                  : "border-stone-300 hover:border-foreground"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Linha">
        <div className="flex flex-wrap gap-2">
          {lines.map((line) => (
            <button
              key={line}
              data-testid={`filter-line-${line.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              onClick={() => toggleLine(line)}
              className={`border px-2.5 py-1.5 text-xs transition-colors ${
                selectedLines.includes(line)
                  ? "border-foreground bg-foreground text-white"
                  : "border-stone-300 hover:border-foreground"
              }`}
            >
              {line}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Preço">
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.max}
              data-testid={`filter-price-max-${range.max}`}
              onClick={() => setPriceMax(priceMax === range.max ? null : range.max)}
              className={`text-left text-xs transition-colors ${
                priceMax === range.max ? "font-semibold text-brand" : "text-stone-600 hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
          <button
            data-testid="filter-price-clear"
            onClick={() => setPriceMax(null)}
            className="text-left text-xs text-stone-400 underline underline-offset-2 hover:text-foreground"
          >
            Limpar preço
          </button>
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function Catalog() {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? undefined;

  const category = useMemo(() => {
    if (slug) return slug;
    if (location.pathname === "/novidades") return "novidades";
    if (location.pathname === "/outlet") return "outlet";
    return undefined;
  }, [slug, location.pathname]);

  const [sort, setSort] = useState("relevance");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  params.set("sort", sort);
  params.set("limit", "200");

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products", "catalog", category ?? "all", q ?? "", sort],
    queryFn: () => apiGet<Product[]>(`/catalog/products?${params.toString()}`),
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<Category[]>("/catalog/categories"),
  });

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (selectedSizes.length) list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s.size) && s.stock > 0));
    if (selectedColors.length) list = list.filter((p) => p.colors.some((c) => selectedColors.includes(c.name)));
    if (selectedLines.length) list = list.filter((p) => selectedLines.includes(p.line));
    if (priceMax) list = list.filter((p) => p.price <= priceMax);
    return list;
  }, [products, selectedSizes, selectedColors, selectedLines, priceMax]);

  const title = q
    ? `Busca: “${q}”`
    : category
      ? (PSEUDO_TITLES[category] ?? categories?.find((c) => c.slug === category)?.name ?? "Produtos")
      : "Todos os Produtos";

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const clearAll = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedLines([]);
    setPriceMax(null);
  };

  const activeFilters =
    selectedSizes.length + selectedColors.length + selectedLines.length + (priceMax ? 1 : 0);

  const panel = (
    <FilterPanel
      products={products ?? []}
      selectedSizes={selectedSizes}
      toggleSize={(s) => toggle(selectedSizes, setSelectedSizes, s)}
      selectedColors={selectedColors}
      toggleColor={(c) => toggle(selectedColors, setSelectedColors, c)}
      selectedLines={selectedLines}
      toggleLine={(l) => toggle(selectedLines, setSelectedLines, l)}
      priceMax={priceMax}
      setPriceMax={setPriceMax}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" data-testid="catalog-page">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-stone-500">
        <Link to="/" className="hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground" data-testid="catalog-title">
          {title}
        </span>
      </nav>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl">{title}</h1>
        <div className="flex items-center gap-3">
          <button
            data-testid="catalog-mobile-filters-button"
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 border border-stone-300 px-3 py-2 text-xs uppercase tracking-wide lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar {activeFilters > 0 ? `(${activeFilters})` : ""}
          </button>
          <Select value={sort} onValueChange={(value: string) => setSort(value)}>
            <SelectTrigger data-testid="catalog-sort-select" size="sm" className="w-44">
              <SelectValue>{SORT_LABELS[sort]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            ...selectedSizes.map((s) => ({ label: `Tam ${s}`, clear: () => setSelectedSizes(selectedSizes.filter((v) => v !== s)) })),
            ...selectedColors.map((c) => ({ label: c, clear: () => setSelectedColors(selectedColors.filter((v) => v !== c)) })),
            ...selectedLines.map((l) => ({ label: `Linha ${l}`, clear: () => setSelectedLines(selectedLines.filter((v) => v !== l)) })),
            ...(priceMax ? [{ label: `Até ${formatBRL(priceMax)}`, clear: () => setPriceMax(null) }] : []),
          ].map((pill) => (
            <button
              key={pill.label}
              data-testid={`catalog-active-filter-${pill.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              onClick={pill.clear}
              className="flex items-center gap-1.5 border border-stone-300 px-2.5 py-1 text-xs hover:border-brand hover:text-brand"
            >
              {pill.label} <X className="h-3 w-3" />
            </button>
          ))}
          <button
            data-testid="catalog-clear-filters-button"
            onClick={clearAll}
            className="text-xs text-stone-500 underline underline-offset-2 hover:text-foreground"
          >
            Limpar tudo
          </button>
        </div>
      )}

      <div className="mt-8 flex gap-10">
        <aside className="hidden w-52 shrink-0 lg:block">{panel}</aside>

        <div className="flex-1">
          <p className="text-xs text-stone-500" data-testid="catalog-count">
            {isLoading ? "Carregando..." : `${filtered.length} produtos`}
          </p>

          {isError && (
            <div className="mt-8 border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
              Não foi possível carregar os produtos agora. Verifique sua conexão e recarregue a página.
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] animate-pulse bg-stone-200/70" />
                    <div className="mt-3 h-3 w-3/4 animate-pulse bg-stone-200/70" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse bg-stone-200/70" />
                  </div>
                ))
              : filtered.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {!isLoading && filtered.length === 0 && !isError && (
            <div className="mt-10 border border-stone-200 bg-white p-10 text-center">
              <p className="text-sm text-stone-600">Nenhum produto encontrado com os filtros selecionados.</p>
              <button
                data-testid="catalog-empty-clear-button"
                onClick={clearAll}
                className="mt-4 border border-foreground px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors hover:bg-foreground hover:text-white"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-h-[80vh] max-w-sm overflow-y-auto">
          <DialogTitle className="font-heading text-xl">Filtros</DialogTitle>
          <div className="mt-4">{panel}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
