import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { Order } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { formatBRL, FREE_SHIPPING_STATES, FREE_SHIPPING_THRESHOLD, PIX_DISCOUNT_RATE, STANDARD_SHIPPING } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATES = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

// Deterministic decorative QR block (simulated — no real payment is processed).
function FakeQrCode() {
  const cells = useMemo(() => {
    const grid: boolean[][] = [];
    for (let r = 0; r < 21; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < 21; c++) row.push((r * 31 + c * 17 + ((r * c) % 7)) % 3 === 0);
      grid.push(row);
    }
    return grid;
  }, []);
  const finder = (top: number, left: number) => (
    <div key={`${top}-${left}`} className="absolute" style={{ top, left }}>
      <div className="h-4 w-4 border-2 border-[#111]" />
    </div>
  );
  return (
    <div className="relative h-40 w-40 bg-white p-2" data-testid="checkout-pix-qr">
      <div className="grid h-full w-full grid-cols-21" style={{ gridTemplateColumns: "repeat(21, 1fr)" }}>
        {cells.flatMap((row, r) =>
          row.map((on, c) => (
            <div key={`${r}-${c}`} className={on ? "bg-[#111]" : "bg-white"} />
          )),
        )}
      </div>
      {finder(0, 0)}
      {finder(0, 128)}
      {finder(128, 0)}
    </div>
  );
}

export default function Checkout() {
  const { items, coupon, setCoupon, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "SC",
  });
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [installments, setInstallments] = useState("6");
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validCoupon = coupon === "GBVIP";
  const couponDiscount = validCoupon ? subtotal * 0.1 : 0;
  const afterCoupon = subtotal - couponDiscount;
  const pixDiscount = paymentMethod === "pix" ? afterCoupon * PIX_DISCOUNT_RATE : 0;
  const shipping =
    afterCoupon - pixDiscount >= FREE_SHIPPING_THRESHOLD && FREE_SHIPPING_STATES.has(form.state)
      ? 0
      : STANDARD_SHIPPING;
  const total = afterCoupon - pixDiscount + shipping;

  const placeOrder = useMutation({
    mutationFn: () =>
      apiPost<Order>("/orders", {
        items: items.map((i) => ({
          product_id: i.product_id,
          slug: i.slug,
          name: i.name,
          size: i.size,
          color: i.color,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        customer: { ...form, email: form.email.trim() },
        payment_method: paymentMethod,
        coupon_code: validCoupon ? coupon : null,
        credit_card:
          paymentMethod === "credit_card"
            ? {
                holder: cardHolder || form.name,
                last4: cardNumber.replace(/\D/g, "").slice(-4) || "0000",
                installments: parseInt(installments, 10),
              }
            : null,
      }),
    onSuccess: (order) => {
      clearCart();
      setCoupon(null);
      navigate(`/pedido/${order.id}`);
    },
    onError: () => {
      toast.error("Não foi possível concluir o pedido. Revise os dados e tente novamente.");
      setSubmitting(false);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) return toast.error("Informe seu nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return toast.error("Informe um e-mail válido.");
    if (form.cep.replace(/\D/g, "").length !== 8) return toast.error("Informe um CEP válido com 8 dígitos.");
    if (!form.street.trim() || !form.number.trim() || !form.city.trim()) return toast.error("Preencha o endereço de entrega.");
    if (paymentMethod === "credit_card" && cardNumber.replace(/\D/g, "").length < 4)
      return toast.error("Informe os dados do cartão.");
    setSubmitting(true);
    placeOrder.mutate();
  };

  if (items.length === 0 && !placeOrder.isSuccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center" data-testid="checkout-empty-page">
        <h1 className="font-heading text-3xl">Nada para finalizar</h1>
        <p className="mt-3 text-sm text-stone-500">Sua sacola está vazia — escolha suas peças favoritas primeiro.</p>
        <Link to="/produtos" className="mt-7 inline-block bg-foreground px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-brand">
          Explorar produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" data-testid="checkout-page">
      <h1 className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl">Finalizar compra</h1>

      <form onSubmit={submit} className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {/* Customer */}
          <section data-testid="checkout-section-customer">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">1 · Dados pessoais</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="checkout-name">Nome completo *</Label>
                <Input id="checkout-name" data-testid="checkout-name-input" value={form.name} onChange={set("name")} placeholder="Como no documento" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="checkout-email">E-mail *</Label>
                <Input id="checkout-email" data-testid="checkout-email-input" type="email" value={form.email} onChange={set("email")} placeholder="voce@email.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="checkout-cpf">CPF</Label>
                <Input id="checkout-cpf" data-testid="checkout-cpf-input" value={form.cpf} onChange={set("cpf")} placeholder="000.000.000-00" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="checkout-phone">Celular / WhatsApp</Label>
                <Input id="checkout-phone" data-testid="checkout-phone-input" value={form.phone} onChange={set("phone")} placeholder="(47) 90000-0000" className="mt-1.5" />
              </div>
            </div>
          </section>

          {/* Address */}
          <section data-testid="checkout-section-address">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">2 · Endereço de entrega</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-6">
              <div>
                <Label htmlFor="checkout-cep">CEP *</Label>
                <Input id="checkout-cep" data-testid="checkout-cep-input" value={form.cep} onChange={(e) => setForm((f) => ({ ...f, cep: e.target.value.replace(/\D/g, "").slice(0, 8) }))} placeholder="00000-000" inputMode="numeric" className="mt-1.5" />
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor="checkout-street">Rua / Avenida *</Label>
                <Input id="checkout-street" data-testid="checkout-street-input" value={form.street} onChange={set("street")} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="checkout-number">Número *</Label>
                <Input id="checkout-number" data-testid="checkout-number-input" value={form.number} onChange={set("number")} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="checkout-complement">Complemento</Label>
                <Input id="checkout-complement" data-testid="checkout-complement-input" value={form.complement} onChange={set("complement")} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="checkout-district">Bairro</Label>
                <Input id="checkout-district" data-testid="checkout-district-input" value={form.district} onChange={set("district")} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="checkout-city">Cidade *</Label>
                <Input id="checkout-city" data-testid="checkout-city-input" value={form.city} onChange={set("city")} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="checkout-state">Estado *</Label>
                <Select value={form.state} onValueChange={(value: string) => setForm((f) => ({ ...f, state: value }))}>
                  <SelectTrigger id="checkout-state" data-testid="checkout-state-select" className="mt-1.5 w-full">
                    <SelectValue>{form.state}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section data-testid="checkout-section-payment">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">3 · Pagamento</h2>
            <Tabs value={paymentMethod} onValueChange={(value: string) => setPaymentMethod(value as "pix" | "credit_card")}>
              <TabsList className="mt-4">
                <TabsTrigger value="pix" data-testid="payment-tab-pix">
                  PIX · 5% OFF
                </TabsTrigger>
                <TabsTrigger value="credit_card" data-testid="payment-tab-credit-card">
                  Cartão · até 6x sem juros
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pix" className="mt-5">
                <div className="flex flex-col items-start gap-6 border border-stone-200 bg-white p-6 sm:flex-row sm:items-center">
                  <FakeQrCode />
                  <div className="text-sm">
                    <p className="font-medium">Pague com PIX e ganhe 5% de desconto imediato</p>
                    <p className="mt-1 text-xs text-stone-500">
                      Escaneie o QR Code no app do seu banco ou copie a chave abaixo. A confirmação é
                      instantânea.
                    </p>
                    <p className="mt-3 border border-stone-200 bg-stone-50 px-3 py-2 text-xs" data-testid="checkout-pix-key">
                      pix@gatabakana.com.br
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="credit_card" className="mt-5">
                <div className="border border-stone-200 bg-white p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="card-holder">Nome no cartão</Label>
                      <Input id="card-holder" data-testid="card-holder-input" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="IGUAL AO CARTÃO" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="card-number">Número do cartão</Label>
                      <Input
                        id="card-number"
                        data-testid="card-number-input"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))}
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Parcelamento</Label>
                      <Select value={installments} onValueChange={(value: string) => setInstallments(value)}>
                        <SelectTrigger data-testid="card-installments-select" className="mt-1.5 w-full">
                          <SelectValue>{`${installments}x de ${formatBRL(total / parseInt(installments, 10))}`}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}x de {formatBRL(total / n)} sem juros
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] text-stone-400">
                    Ambiente de demonstração — nenhum cartão é cobrado de verdade.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* Review */}
        <aside className="h-fit border border-stone-200 bg-white p-6" data-testid="checkout-review">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Revisão do pedido</p>
          <div className="mt-4 max-h-64 space-y-4 overflow-y-auto pr-1">
            {items.map((item, i) => (
              <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-3" data-testid="checkout-review-item">
                <img src={item.image} alt={item.name} className="h-20 w-16 shrink-0 object-cover" />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="line-clamp-2 font-medium uppercase tracking-wide">{item.name}</p>
                  <p className="mt-1 text-stone-500">
                    {item.color} · Tam {item.size} · {item.quantity}x
                  </p>
                  <p className="mt-1 font-semibold" data-testid={`checkout-review-item-${i}-total`}>
                    {formatBRL(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-600">Subtotal</dt>
              <dd data-testid="checkout-subtotal">{formatBRL(subtotal)}</dd>
            </div>
            {validCoupon && (
              <div className="flex justify-between text-green-700">
                <dt>Cupom GBVIP</dt>
                <dd data-testid="checkout-coupon-discount">-{formatBRL(couponDiscount)}</dd>
              </div>
            )}
            {pixDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Desconto PIX (5%)</dt>
                <dd data-testid="checkout-pix-discount">-{formatBRL(pixDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-stone-600">Frete</dt>
              <dd data-testid="checkout-shipping">{shipping === 0 ? "GRÁTIS" : formatBRL(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-bold">
              <dt>Total</dt>
              <dd data-testid="checkout-total">{formatBRL(total)}</dd>
            </div>
            {paymentMethod === "credit_card" && (
              <p className="text-xs text-stone-500">em {installments}x de {formatBRL(total / parseInt(installments, 10))} sem juros</p>
            )}
          </dl>

          <button
            type="submit"
            data-testid="checkout-submit-button"
            disabled={submitting}
            className="mt-6 w-full bg-foreground py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand disabled:opacity-60"
          >
            {submitting ? "Processando..." : paymentMethod === "pix" ? "Gerar pedido e pagar com PIX" : "Confirmar pedido"}
          </button>
          <Link to="/carrinho" data-testid="checkout-back-to-cart-link" className="mt-3 block text-center text-[11px] uppercase tracking-[0.15em] text-stone-500 underline underline-offset-4 hover:text-foreground">
            Voltar para a sacola
          </Link>
        </aside>
      </form>
    </div>
  );
}
