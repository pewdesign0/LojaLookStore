import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, PackageCheck, Ruler, Truck } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { cepInfo, discountPct, formatBRL, formatInstallments, FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_STATES } from "@/lib/format";
import ProductCard from "@/components/product/ProductCard";
import ProductRow from "@/components/product/ProductRow";
import { Button } from "@/components/ui/button";

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-200" data-testid={`pdp-accordion-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-5 text-sm leading-relaxed text-stone-600">{children}</div>}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem, setDrawerOpen, subtotal: cartSubtotal } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [cepResult, setCepResult] = useState<ReturnType<typeof cepInfo> & { shipping: number } | null>(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiGet<Product>(`/catalog/products/${slug}`),
  });

  const { data: related } = useQuery({
    queryKey: ["products", "related", product?.category],
    queryFn: () => apiGet<Product[]>(`/catalog/products?category=${product!.category}&limit=12`),
    enabled: !!product,
  });

  const relatedList = useMemo(
    () => (related ?? []).filter((p) => p.slug !== product?.slug).slice(0, 8),
    [related, product?.slug],
  );

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="aspect-[3/4] animate-pulse bg-stone-200/70" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse bg-stone-200/70" />
          <div className="h-8 w-3/4 animate-pulse bg-stone-200/70" />
          <div className="h-6 w-40 animate-pulse bg-stone-200/70" />
          <div className="h-32 w-full animate-pulse bg-stone-200/70" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center" data-testid="pdp-not-found">
        <h1 className="font-heading text-3xl">Produto não encontrado</h1>
        <p className="mt-3 text-sm text-stone-500">O item que você procura pode ter saído de linha.</p>
        <Link to="/produtos" className="mt-6 inline-block bg-foreground px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-brand">
          Ver todos os produtos
        </Link>
      </div>
    );
  }

  const discount = discountPct(product.price, product.old_price);
  const selectedColor = color ?? product.colors[0]?.name ?? "Único";
  const pixPrice = product.price * 0.95;

  const addToCart = () => {
    if (!size) {
      toast.error("Selecione um tamanho para continuar.");
      return;
    }
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      size,
      color: selectedColor,
      image: product.images[0] ?? "",
      price: product.price,
      quantity: 1,
    });
    setDrawerOpen(true);
    toast.success("Adicionado à sacola!", { description: `${product.name} · ${selectedColor} · Tam ${size}` });
  };

  const calculateShipping = () => {
    const info = cepInfo(cep, cartSubtotal + product.price);
    if (!info) {
      toast.error("Informe um CEP válido com 8 dígitos.");
      return;
    }
    const shipping = info.freeEligible ? 0 : 24.9;
    setCepResult({ ...info, shipping });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" data-testid="product-detail-page">
      <nav className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-stone-500">
        <Link to="/" className="hover:text-foreground">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/categoria/${product.category}`} className="hover:text-foreground">{product.category.replace(/-/g, " ")}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div data-testid="pdp-gallery">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={product.images[imageIndex]}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.06]"
            />
            {discount !== null && (
              <span className="absolute left-4 top-4 bg-brand px-2.5 py-1 text-xs font-bold text-white">
                -{discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((image, i) => (
                <button
                  key={image}
                  data-testid={`pdp-thumbnail-${i}`}
                  aria-label={`Ver imagem ${i + 1}`}
                  onClick={() => setImageIndex(i)}
                  className={`h-20 w-16 overflow-hidden border-2 ${i === imageIndex ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500" data-testid="pdp-reference">
            Ref. {product.reference} · Linha {product.line}
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl" data-testid="pdp-name">{product.name}</h1>

          <div className="mt-5" data-testid="pdp-price-block">
            {product.old_price && (
              <p className="text-sm text-stone-400 line-through">{formatBRL(product.old_price)}</p>
            )}
            <p className="text-3xl font-bold tracking-tight">{formatBRL(product.price)}</p>
            <p className="mt-1 text-sm text-stone-600" data-testid="pdp-installments">
              em até 6x de {formatInstallments(product.price)} sem juros no cartão
            </p>
            <p className="text-sm font-medium text-green-700" data-testid="pdp-pix-price">
              ou {formatBRL(pixPrice)} no PIX (5% de desconto)
            </p>
          </div>

          {/* Colors */}
          <div className="mt-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Cor: <span className="font-normal normal-case text-stone-500">{selectedColor}</span>
            </p>
            <div className="mt-3 flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  data-testid={`pdp-color-${c.name.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  aria-label={`Cor ${c.name}`}
                  onClick={() => setColor(c.name)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === c.name ? "border-foreground" : "border-stone-300"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Tamanho {size && <span className="font-normal normal-case text-stone-500">· {size}</span>}
              </p>
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Ruler className="h-3 w-3" /> PP · P · M · G · GG
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.size}
                  data-testid={`pdp-size-${s.size.toLowerCase()}`}
                  disabled={s.stock === 0}
                  onClick={() => setSize(s.size)}
                  className={`min-w-12 border px-3 py-2.5 text-sm transition-colors ${
                    s.stock === 0
                      ? "cursor-not-allowed border-stone-200 text-stone-300 line-through"
                      : size === s.size
                        ? "border-foreground bg-foreground text-white"
                        : "border-stone-300 hover:border-foreground"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          <Button
            data-testid="pdp-add-to-cart-button"
            size="lg"
            className="mt-8 w-full"
            onClick={addToCart}
          >
            Adicionar à Sacola — {formatBRL(product.price)}
          </Button>

          {/* Shipping calculator */}
          <div className="mt-6 border border-stone-200 p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <Truck className="h-4 w-4" /> Calcular frete e prazo
            </p>
            <div className="mt-3 flex gap-2">
              <input
                data-testid="pdp-cep-input"
                value={cep}
                onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="CEP (ex.: 88015000)"
                inputMode="numeric"
                className="w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-foreground"
              />
              <Button variant="outline" data-testid="pdp-cep-calculate-button" onClick={calculateShipping}>
                Calcular
              </Button>
            </div>
            {cepResult && (
              <div className="mt-3 space-y-1.5 text-xs text-stone-600" data-testid="pdp-cep-result">
                <p className="font-medium text-foreground">
                  {cepResult.region} — {cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
                </p>
                <p className="flex items-center gap-1.5">
                  <PackageCheck className="h-3.5 w-3.5 text-green-700" />
                  {cepResult.shipping === 0
                    ? "PAC — GRÁTIS (compra acima de R$ 499)"
                    : `PAC — ${formatBRL(cepResult.shipping)} · ${cepResult.pacDays} dias úteis`}
                </p>
                <p>Sedex — R$ 34,90 · {cepResult.sedexDays} dias úteis</p>
              </div>
            )}
          </div>

          {/* Details accordions */}
          <div className="mt-8">
            <Accordion title="Descrição" defaultOpen>
              {product.description}
            </Accordion>
            <Accordion title="Composição e cuidados">
              {product.composition}. Lavar à mão ou ciclo delicado, não usar alvejante, secar à sombra.
            </Accordion>
            <Accordion title="Frete e trocas">
              Frete grátis acima de {formatBRL(FREE_SHIPPING_THRESHOLD)} para {Array.from(FREE_SHIPPING_STATES).join(", ")}. Primeira
              troca gratuita em até 30 dias — é só enviar sua peça com a etiqueta.
            </Accordion>
          </div>
        </div>
      </div>

      {relatedList.length > 0 && (
        <div className="mt-16">
          <ProductRow eyebrow="Combina com" title="Você Também Vai Amar" products={relatedList} />
        </div>
      )}
    </div>
  );
}
