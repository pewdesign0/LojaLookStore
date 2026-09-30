import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import HeroCarousel from "@/components/home/HeroCarousel";
import CategoryTiles from "@/components/home/CategoryTiles";
import Newsletter from "@/components/home/Newsletter";
import ProductRow from "@/components/product/ProductRow";

const fetchProducts = (query: string) => apiGet<Product[]>(`/catalog/products?${query}`);

const BRAND_LINES = [
  { name: "Trendy", text: "as tendências do momento traduzidas em peças modernas, do trabalho ao encontro." },
  { name: "Glam", text: "o glamour da noite e o casual chic que valorizam as curvas com sofisticação." },
  { name: "Superjeans", text: "jeans com as últimas tecnologias em tecido, lavações e modelagens." },
  { name: "Basic", text: "peças versáteis e atemporais que compõem looks clássicos e fashion." },
  { name: "Beachwear", text: "cores, formas e estampas pensadas no biotipo das brasileiras." },
  { name: "Mais Gata", text: "a assinatura exclusiva de estampas, shapes e tecidos fluidos da marca." },
];

export default function Home() {
  const { data: maisVendidas, isLoading: loadingMais } = useQuery({
    queryKey: ["products", "mais-vendidas"],
    queryFn: () => fetchProducts("flag=mais_vendida&limit=10"),
  });
  const { data: jeans, isLoading: loadingJeans } = useQuery({
    queryKey: ["products", "jeans"],
    queryFn: () => fetchProducts("jeans=true&limit=10"),
  });
  const { data: destaque, isLoading: loadingDestaque } = useQuery({
    queryKey: ["products", "destaque"],
    queryFn: () => fetchProducts("flag=destaque&limit=10"),
  });
  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ["products", "trends"],
    queryFn: () => fetchProducts("flag=trends&limit=10"),
  });

  return (
    <div data-testid="home-page">
      <HeroCarousel />
      <CategoryTiles />

      <ProductRow
        eyebrow="Sucessos do momento"
        title="As Mais Vendidas"
        products={maisVendidas ?? []}
        isLoading={loadingMais}
        cta={{ label: "Ver tudo", to: "/produtos" }}
      />

      {/* Jeans collection: split banner + row */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" data-testid="jeans-banner">
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <Link to="/categoria/calcas" className="group relative block aspect-[16/9] overflow-hidden bg-muted md:aspect-[2/1]">
            <img
              src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?q=85&w=1200&auto=format&fit=crop"
              alt="Coleção Jeans — Detalhes"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25" />
            <p className="absolute bottom-5 left-6 text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Detalhes
            </p>
          </Link>
          <Link to="/outlet" className="group relative block aspect-[16/9] overflow-hidden bg-muted md:aspect-[2/1]">
            <img
              src="https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?q=85&w=1200&auto=format&fit=crop"
              alt="Coleção Jeans — Natural"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25" />
            <p className="absolute bottom-5 left-6 text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Natural
            </p>
          </Link>
        </div>
      </section>

      <ProductRow
        eyebrow="Superjeans"
        title="Coleção Jeans"
        products={jeans ?? []}
        isLoading={loadingJeans}
        cta={{ label: "Ver tudo", to: "/categoria/calcas" }}
      />

      {/* Destaque: wide banner + row */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" data-testid="destaque-banner">
        <Link to="/produtos" className="group relative block aspect-[16/9] overflow-hidden bg-muted lg:aspect-[21/8]">
          <img
            src="https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=85&w=1800&auto=format&fit=crop"
            alt="Destaques da Coleção"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em]">Coleção Destaque</p>
            <p className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
              Conheça os mais desejados da estação
            </p>
          </div>
        </Link>
      </section>

      <ProductRow
        eyebrow="Seleção especial"
        title="Coleção Destaque"
        products={destaque ?? []}
        isLoading={loadingDestaque}
        cta={{ label: "Ver tudo", to: "/produtos" }}
      />

      <ProductRow
        eyebrow="Trends"
        title="As Peças Mais Desejadas do Momento"
        products={trends ?? []}
        isLoading={loadingTrends}
        cta={{ label: "Ver tudo", to: "/produtos" }}
      />

      <Newsletter />

      {/* SEO storytelling */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6" data-testid="seo-section">
        <h2 className="text-center text-3xl font-semibold tracking-[0.1em]">GATABAKANA</h2>
        <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-stone-500">
          Moda Feminina Online
        </p>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-stone-700">
          <p>
            A <strong>Gatabakana</strong> é referência em <em>moda feminina no Brasil</em>, com coleções
            que unem estilo, conforto e sofisticação. Nossas roupas femininas são criadas para mulheres
            modernas que buscam peças versáteis, de alta qualidade e caimento impecável.
          </p>
          <p>
            A marca catarinense nasceu em 2003 a partir da visão empresarial do casal Silvana e Silvério
            Kuszkowski, com uma proposta inovadora: traduzir o DNA da mulher brasileira em coleções que
            realmente entendem a sua beleza. Hoje somos mais de 2.500 pontos de venda espalhados pelo
            país — e este e-commerce, para levar o melhor da moda feminina até o seu lar.
          </p>
          <p>
            Seja qual for o seu estilo, as linhas Gatabakana te acompanham em todas as situações:
          </p>
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {BRAND_LINES.map((line) => (
            <div key={line.name}>
              <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                Linha {line.name}
              </dt>
              <dd className="mt-1 text-xs leading-relaxed text-stone-600">{line.text}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 text-center">
          <Link
            to="/produtos"
            data-testid="seo-cta-link"
            className="inline-block bg-foreground px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand"
          >
            Conheça nossas coleções
          </Link>
        </div>
      </section>
    </div>
  );
}
