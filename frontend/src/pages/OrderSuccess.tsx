import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, CheckCircle2, Copy, PackageCheck } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Order } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export default function OrderSuccess() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiGet<Order>(`/orders/${id}`),
    retry: false,
  });

  const copyPix = () => {
    navigator.clipboard?.writeText("pix@gatabakana.com.br").then(() => {
      setCopied(true);
      toast.success("Chave PIX copiada!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center" data-testid="order-loading">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-stone-200" />
        <p className="mt-4 text-sm text-stone-500">Carregando seu pedido...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center" data-testid="order-not-found">
        <h1 className="font-heading text-3xl">Pedido não encontrado</h1>
        <p className="mt-3 text-sm text-stone-500">Verifique o link ou entre em contato com o atendimento.</p>
        <Link to="/" className="mt-6 inline-block bg-foreground px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-brand">
          Voltar à loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6" data-testid="order-success-page">
      <div className="border border-stone-200 bg-white p-8 text-center sm:p-12">
        <CheckCircle2 data-testid="order-success-icon" className="mx-auto h-14 w-14 text-green-600" />
        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.25em] text-brand">Pedido confirmado</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl">
          Obrigada, {order.customer.name.split(" ")[0]}!
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Seu pedido <span className="font-bold" data-testid="order-number">{order.number}</span> foi
          registrado com sucesso. Você também receberá a confirmação por e-mail.
        </p>

        <div className="mx-auto mt-8 grid gap-4 text-left sm:grid-cols-2">
          <div className="border border-stone-200 p-4" data-testid="order-payment-block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Pagamento</p>
            {order.payment_method === "pix" ? (
              <>
                <p className="mt-2 text-sm font-medium">PIX — 5% de desconto aplicado</p>
                <button
                  data-testid="order-pix-copy-button"
                  onClick={copyPix}
                  className="mt-3 flex w-full items-center justify-between border border-stone-300 px-3 py-2.5 text-xs transition-colors hover:border-foreground"
                >
                  <span>Chave: pix@gatabakana.com.br</span>
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm font-medium" data-testid="order-card-info">
                Cartão de crédito — {order.credit_card?.installments ?? 1}x de{" "}
                {formatBRL(order.total / (order.credit_card?.installments ?? 1))} sem juros · ••••{" "}
                {order.credit_card?.last4 || "0000"} (autorização simulada)
              </p>
            )}
          </div>
          <div className="border border-stone-200 p-4" data-testid="order-delivery-block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Entrega</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
              <PackageCheck className="h-4 w-4 text-green-700" />
              Previsão: <span data-testid="order-delivery-date">{order.estimated_delivery}</span>
            </p>
            <p className="mt-2 text-xs text-stone-500">
              {order.customer.street}, {order.customer.number} · {order.customer.city} — {order.customer.state}
            </p>
          </div>
        </div>

        <div className="mt-8 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Itens</p>
          <div className="mt-3 space-y-3">
            {order.items.map((item, i) => (
              <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex items-center gap-3" data-testid="order-item">
                <img src={item.image} alt={item.name} className="h-16 w-12 object-cover" />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="line-clamp-1 font-medium uppercase tracking-wide">{item.name}</p>
                  <p className="text-stone-500">
                    {item.color} · Tam {item.size} · {item.quantity}x
                  </p>
                </div>
                <p className="text-sm font-semibold" data-testid={`order-item-${i}-total`}>
                  {formatBRL(item.line_total)}
                </p>
              </div>
            ))}
          </div>

          <dl className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
            <div className="flex justify-between text-stone-600">
              <dt>Subtotal</dt>
              <dd data-testid="order-subtotal">{formatBRL(order.subtotal)}</dd>
            </div>
            {order.coupon_discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Cupom {order.coupon_code}</dt>
                <dd data-testid="order-coupon-discount">-{formatBRL(order.coupon_discount)}</dd>
              </div>
            )}
            {order.pix_discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Desconto PIX</dt>
                <dd data-testid="order-pix-discount">-{formatBRL(order.pix_discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <dt>Frete</dt>
              <dd data-testid="order-shipping">{order.shipping === 0 ? "GRÁTIS" : formatBRL(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd data-testid="order-total">{formatBRL(order.total)}</dd>
            </div>
          </dl>
        </div>

        <Link
          to="/produtos"
          data-testid="order-continue-shopping-button"
          className="mt-10 inline-block bg-foreground px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
