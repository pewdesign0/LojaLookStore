import { useState } from "react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import type { NewsletterResponse } from "@/lib/types";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost<NewsletterResponse>("/newsletter", { email });
      toast.success("Inscrição confirmada!", { description: res.message });
      setEmail("");
    } catch {
      toast.error("Não foi possível concluir a inscrição. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#F5F3EF] py-14" data-testid="newsletter-section">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand">#GBLovers</p>
        <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Receba novidades e ganhe 10% off na primeira compra
        </h2>
        <form className="mx-auto mt-7 flex max-w-md gap-2" onSubmit={subscribe}>
          <input
            data-testid="newsletter-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            className="w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
          />
          <button
            type="submit"
            data-testid="newsletter-submit-button"
            disabled={submitting}
            className="shrink-0 bg-foreground px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Assinar"}
          </button>
        </form>
        <p className="mt-4 text-xs text-stone-500">
          Ao assinar você entra para o time #GBLovers e recebe o cupom GBVIP para 10% de desconto.
        </p>
      </div>
    </section>
  );
}
