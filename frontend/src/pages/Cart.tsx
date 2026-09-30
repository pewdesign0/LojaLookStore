import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { CouponValidation } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { formatBRL, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import ShippingCalculator from "@/components/ShippingCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Cart() {
  const { items, coupon, setCoupon, subtotal, updateQuantity, removeItem } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponValid, setCouponValid] = useState<boolean | null>(null);

  const validateCoupon = useMutation({
    mutationFn: (code: string) => apiPost<CouponValidation>("/coupons/validate", { code }),
    onSuccess: (res, code) => {
      setCouponValid(res.valid);
      if (res.valid) {
        setCoupon(code.trim().toUpperCase());
        toast.success(res.message);
      } else {
        setCoupon(null);
        toast.error(res.message);
      }
    },
    onError: () => toast.error("Não foi possível validar o cupom agora."),
  });

  const couponDiscount = couponValid && coupon ? subtotal * 0.1 : 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center" data-testid="cart-empty-page">
        <ShoppingBag className="mx-auto h-12 w-12 text-stone-300" />
        <h1 className="mt-5 font-heading text-3xl">Sua sacola está vazia</h1>
        <p className="mt-3 text-sm text-stone-500">Que tal renovar o closet com as novidades da estação?</p>
        <Link
          to="/produtos"
          data-testid="cart-empty-shop-button"
          className="mt-7 inline-block bg-foreground px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
        >
          Explorar produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" data-testid="cart-page">
      <h1 className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl">Sacola</h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Lines */}
        <div>
          {items.map((item, i) => (
            <div
              key={`${item.product_id}-${item.size}-${item.color}`}
              data-testid="cart-line"
              className="flex gap-5 border-b border-stone-200 py-6 first:pt-0"
            >
              <Link to={`/produto/${item.slug}`} className="shrink-0">
                <img src={item.image} alt={item.name} className="h-36 w-28 object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-sm font-medium uppercase tracking-[0.06em]">{item.name}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {item.color} · Tamanho {item.size}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  6x de {formatBRL(item.price / 6)} sem juros
                </p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-stone-300">
                    <button
                      data-testid={`cart-line-${i}-quantity-decrease`}
                      aria-label="Diminuir quantidade"
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                      className="p-2 text-stone-500 hover:text-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span data-testid={`cart-line-${i}-quantity`} className="w-9 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      data-testid={`cart-line-${i}-quantity-increase`}
                      aria-label="Aumentar quantidade"
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                      className="p-2 text-stone-500 hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-base font-bold" data-testid={`cart-line-${i}-total`}>
                    {formatBRL(item.price * item.quantity)}
                  </p>
                </div>
              </div>
              <button
                data-testid={`cart-line-${i}-remove-button`}
                aria-label={`Remover ${item.name}`}
                onClick={() => removeItem(item.product_id, item.size, item.color)}
                className="self-start text-stone-300 transition-colors hover:text-brand"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit border border-stone-200 bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Resumo da compra</p>

          <div className="mt-5" data-testid="cart-coupon-block">
            <label className="text-xs text-stone-600">Cupom de desconto</label>
            <div className="mt-2 flex gap-2">
              <Input
                data-testid="coupon-input"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Ex.: GBVIP"
                className="uppercase"
              />
              <Button
                variant="outline"
                data-testid="coupon-apply-button"
                disabled={validateCoupon.isPending || !couponInput.trim()}
                onClick={() => validateCoupon.mutate(couponInput.trim())}
              >
                Aplicar
              </Button>
            </div>
            {coupon && couponValid && (
              <p className="mt-2 text-xs font-medium text-green-700" data-testid="coupon-applied-label">
                Cupom {coupon} aplicado — 10% OFF
              </p>
            )}
          </div>

          <dl className="mt-6 space-y-2.5 border-t border-stone-200 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-600">Subtotal</dt>
              <dd data-testid="cart-subtotal">{formatBRL(subtotal)}</dd>
            </div>
            {couponValid && coupon && (
              <div className="flex justify-between text-green-700">
                <dt>Desconto GBVIP (10%)</dt>
                <dd data-testid="cart-coupon-discount">-{formatBRL(couponDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-stone-600">Frete</dt>
              <dd className="text-stone-600" data-testid="cart-shipping-note">
                {remaining > 0
                  ? `a partir de R$ 24,90 — ${formatBRL(remaining)} para frete grátis*`
                  : "GRÁTIS*"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd data-testid="cart-total">{formatBRL(subtotal - couponDiscount)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-stone-400">
            *Frete grátis acima de R$ 499 para SC, SP, MG, PR, RS e RJ. Pague no PIX e ganhe 5% de
            desconto adicional.
          </p>

          <div className="mt-5">
            <ShippingCalculator subtotal={subtotal - couponDiscount} testIdPrefix="cart-shipping" />
          </div>

          <Link
            to="/checkout"
            data-testid="cart-checkout-button"
            className="mt-6 block bg-foreground py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
          >
            Finalizar compra
          </Link>
          <Link
            to="/produtos"
            data-testid="cart-continue-shopping-link"
            className="mt-3 block text-center text-[11px] font-medium uppercase tracking-[0.15em] text-stone-600 underline underline-offset-4 hover:text-foreground"
          >
            Continuar comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
