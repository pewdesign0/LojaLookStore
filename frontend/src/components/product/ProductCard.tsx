import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { discountPct, formatBRL, formatInstallments } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, setDrawerOpen } = useCart();
  const discount = discountPct(product.price, product.old_price);
  const hoverImage = product.images.length > 1 ? product.images[1] : null;

  const quickAdd = () => {
    const size = product.sizes.find((s) => s.stock > 0) ?? product.sizes[0];
    const color = product.colors[0]?.name ?? "Único";
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      size: size?.size ?? "Único",
      color,
      image: product.images[0] ?? "",
      price: product.price,
      quantity: 1,
    });
    setDrawerOpen(true);
    toast.success("Adicionado à sacola!", { description: product.name });
  };

  return (
    <div data-testid={`product-card-${product.slug}`} className="group relative flex flex-col">
      <Link
        to={`/produto/${product.slug}`}
        data-testid={`product-card-link-${product.slug}`}
        aria-label={`Ver produto ${product.name}`}
        className="relative block aspect-[3/4] overflow-hidden bg-muted"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] ${
            hoverImage ? "group-hover:opacity-0" : ""
          }`}
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} — detalhe`}
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {discount !== null && (
          <span data-testid={`product-card-discount-badge-${product.slug}`} className="absolute left-3 top-3 bg-brand px-2 py-1 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {discount === null && product.novidade && (
          <span className="absolute left-3 top-3 bg-foreground px-2 py-1 text-[11px] font-bold text-white">
            NOVIDADE
          </span>
        )}

        <button
          data-testid={`product-card-quick-add-${product.slug}`}
          aria-label={`Adicionar ${product.name} à sacola`}
          onClick={(e) => {
            e.preventDefault();
            quickAdd();
          }}
          className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-white/95 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-stone-900 transition-transform duration-300 hover:bg-foreground hover:text-white group-hover:translate-y-0"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Adicionar à sacola
        </button>
      </Link>

      <div className="pt-3">
        <p className="line-clamp-2 text-xs font-medium uppercase tracking-[0.08em] text-stone-800">
          {product.name}
        </p>
        {product.colors.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            {product.colors.map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-3 w-3 rounded-full border border-stone-300"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}
        <div className="mt-2" data-testid={`product-card-price-${product.slug}`}>
          {product.old_price && (
            <p className="text-xs text-stone-400 line-through">{formatBRL(product.old_price)}</p>
          )}
          <p className="text-base font-bold tracking-tight">{formatBRL(product.price)}</p>
          <p className="text-xs text-stone-600">6x de {formatInstallments(product.price)} sem juros</p>
        </div>
      </div>
    </div>
  );
}
