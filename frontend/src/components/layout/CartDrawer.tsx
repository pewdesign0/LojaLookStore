import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatBRL, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";

export default function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen, updateQuantity, removeItem } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <SheetTitle className="text-sm font-medium uppercase tracking-[0.15em]">
            Sacola ({items.length})
          </SheetTitle>
          <button
            data-testid="cart-drawer-close-button"
            aria-label="Fechar sacola"
            onClick={() => setDrawerOpen(false)}
            className="text-stone-500 transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">Sua sacola está vazia.</p>
            <Link
              to="/produtos"
              data-testid="cart-drawer-empty-shop-link"
              onClick={() => setDrawerOpen(false)}
              className={buttonVariants({ variant: "outline" })}
            >
              Explorar produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-stone-200 py-3">
              <p className="text-xs text-stone-600">
                {remaining > 0 ? (
                  <>
                    Faltam <span className="font-semibold text-green-700">{formatBRL(remaining)}</span> para{" "}
                    <span className="font-semibold text-green-700">FRETE GRÁTIS</span> (Sul e Sudeste)
                  </>
                ) : (
                  <span className="font-semibold text-green-700">Você ganhou FRETE GRÁTIS! (Sul e Sudeste)</span>
                )}
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  data-testid="cart-drawer-free-shipping-progress"
                  className="h-full bg-green-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {items.map((item, i) => (
                <div
                  key={`${item.product_id}-${item.size}-${item.color}`}
                  data-testid="cart-drawer-item"
                  className="flex gap-3 py-3"
                >
                  <img src={item.image} alt={item.name} className="h-24 w-18 shrink-0 object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-2 text-xs font-medium uppercase tracking-wide">{item.name}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {item.color} · Tam {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-stone-200">
                        <button
                          data-testid={`cart-drawer-item-${i}-quantity-decrease`}
                          aria-label="Diminuir quantidade"
                          onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                          className="p-1.5 text-stone-500 hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span data-testid={`cart-drawer-item-${i}-quantity`} className="w-7 text-center text-xs">
                          {item.quantity}
                        </span>
                        <button
                          data-testid={`cart-drawer-item-${i}-quantity-increase`}
                          aria-label="Aumentar quantidade"
                          onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                          className="p-1.5 text-stone-500 hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold">{formatBRL(item.price * item.quantity)}</p>
                    </div>
                  </div>
                  <button
                    data-testid={`cart-drawer-item-${i}-remove-button`}
                    aria-label={`Remover ${item.name} da sacola`}
                    onClick={() => removeItem(item.product_id, item.size, item.color)}
                    className="self-start text-stone-300 transition-colors hover:text-brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase tracking-[0.15em] text-stone-500">Subtotal</span>
                <span data-testid="cart-drawer-subtotal" className="text-lg font-bold">
                  {formatBRL(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Frete e descontos calculados no checkout · 6x de {formatBRL(subtotal / 6)} sem juros
              </p>
              <Link
                to="/checkout"
                data-testid="cart-drawer-checkout-button"
                onClick={() => setDrawerOpen(false)}
                className={`${buttonVariants({ size: "lg" })} mt-4 w-full`}
              >
                Finalizar compra
              </Link>
              <Link
                to="/carrinho"
                data-testid="cart-drawer-view-cart-link"
                onClick={() => setDrawerOpen(false)}
                className="mt-2 block w-full text-center text-[11px] font-medium uppercase tracking-[0.15em] text-stone-600 underline underline-offset-4 hover:text-foreground"
              >
                Ver sacola completa
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
