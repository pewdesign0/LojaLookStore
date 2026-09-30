import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center" data-testid="not-found-page">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand">Erro 404</p>
      <h1 className="mt-3 font-heading text-4xl">Página não encontrada</h1>
      <p className="mt-3 text-sm text-stone-500">
        O link que você acessou não existe ou saiu do ar.
      </p>
      <Link
        to="/"
        data-testid="not-found-home-link"
        className="mt-8 inline-block bg-foreground px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
      >
        Voltar à loja
      </Link>
    </div>
  );
}
