import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";

const CATEGORY_LINKS = [
  { label: "Novidades", to: "/novidades" },
  { label: "Vestidos", to: "/categoria/vestidos" },
  { label: "Blusas & Croppeds", to: "/categoria/blusas" },
  { label: "Calças & Jeans", to: "/categoria/calcas" },
  { label: "Shorts & Saias", to: "/categoria/shorts-e-saias" },
  { label: "Beachwear", to: "/categoria/beachwear" },
  { label: "Outlet 50% OFF", to: "/outlet" },
];

const HELP_LINKS = [
  "Central de Atendimento",
  "Trocas e Devoluções",
  "Prazos de Entrega",
  "Política de Privacidade",
  "Termos de Uso",
];

export default function Footer() {
  return (
    <footer className="bg-[#141414] text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-heading text-2xl font-semibold tracking-[0.12em] text-white">GATABAKANA</p>
          <p className="mt-3 text-xs leading-relaxed text-stone-400">
            Moda feminina autoral catarinense desde 2003. Coleções que traduzem o DNA da mulher
            moderna, empoderada e dona de si.
          </p>
          <div className="mt-5 flex gap-4">
            <a href="https://www.instagram.com/gatabakana" target="_blank" rel="noreferrer" aria-label="Instagram Gatabakana" className="text-stone-400 transition-colors hover:text-white">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://pt-br.facebook.com/GataBakanaOficial" target="_blank" rel="noreferrer" aria-label="Facebook Gatabakana" className="text-stone-400 transition-colors hover:text-white">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://vm.tiktok.com/ZMJkRhFQ8/" target="_blank" rel="noreferrer" aria-label="TikTok Gatabakana" className="text-stone-400 transition-colors hover:text-white">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white">Categorias</p>
          <ul className="mt-4 space-y-2.5">
            {CATEGORY_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} data-testid={`footer-category-${link.to.replace(/\//g, "-")}`} className="text-xs text-stone-400 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white">Atendimento</p>
          <ul className="mt-4 space-y-2.5">
            {HELP_LINKS.map((label) => (
              <li key={label}>
                <a href="#" className="text-xs text-stone-400 transition-colors hover:text-white">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-stone-400">
            Atendimento por WhatsApp: (47) 3379-4412 · seg a sex, 9h às 18h
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white">Pagamento</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["PIX 5% OFF", "VISA", "MASTER", "ELO", "6X SEM JUROS", "BOLETO"].map((label) => (
              <span key={label} className="border border-stone-700 px-2.5 py-1.5 text-[10px] font-medium tracking-wider text-stone-300">
                {label}
              </span>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-stone-500">
            Frete grátis acima de R$ 499 para SC, SP, MG, PR, RS e RJ.
          </p>
        </div>
      </div>

      <div className="border-t border-stone-800 py-5">
        <p className="mx-auto max-w-7xl px-4 text-[11px] text-stone-500 sm:px-6 lg:px-8">
          © 2026 Gatabakana · Projeto demonstrativo gata-commerce · Loja criada para fins de estudo —
          nenhuma compra real é processada.
        </p>
      </div>
    </footer>
  );
}
