import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    tag: "NOVA COLEÇÃO 2026",
    title: "Lançamento Primavera",
    subtitle: "FLUIDEZ, CORES VIBRANTES E ELEGÂNCIA CATARINENSE",
    cta: "VER LANÇAMENTOS",
    to: "/novidades",
    image:
      "https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?q=85&w=1800&auto=format&fit=crop",
  },
  {
    tag: "OUTLET EXCLUSIVO",
    title: "Superjeans 50% OFF",
    subtitle: "MODELAGEM PERFEITA E TECNOLOGIA QUE VALORIZA AS CURVAS",
    cta: "COMPRAR JEANS",
    to: "/outlet",
    image:
      "https://images.unsplash.com/photo-1714729382668-7bc3bb261662?q=85&w=1800&auto=format&fit=crop",
  },
  {
    tag: "COLEÇÃO TAKE ME TO IBIZA",
    title: "Linha Beachwear & Glam",
    subtitle: "BIQUÍNIS, MAIÔS E SAÍDAS DE PRAIA FEITAS PARA BRILHAR",
    cta: "EXPLORAR BEACHWEAR",
    to: "/categoria/beachwear",
    image:
      "https://images.unsplash.com/photo-1570700005880-4ecdb8595d4a?q=85&w=1800&auto=format&fit=crop",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <section data-testid="hero-carousel" className="relative h-[68vh] min-h-[440px] overflow-hidden bg-stone-900">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={index}
          src={slide.image}
          alt={slide.title}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-xl text-white"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/90">{slide.tag}</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl lg:text-6xl">{slide.title}</h1>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-white/85 sm:text-sm">
              {slide.subtitle}
            </p>
            <Link
              to={slide.to}
              data-testid={`hero-cta-${index}`}
              className="mt-7 inline-block bg-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-900 transition-colors hover:bg-brand hover:text-white"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        data-testid="hero-carousel-previous-button"
        aria-label="Banner anterior"
        onClick={() => setIndex((index - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 border border-white/40 p-2.5 text-white transition-colors hover:bg-white hover:text-stone-900 md:block"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        data-testid="hero-carousel-next-button"
        aria-label="Próximo banner"
        onClick={() => setIndex((index + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 border border-white/40 p-2.5 text-white transition-colors hover:bg-white hover:text-stone-900 md:block"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            data-testid={`hero-dot-${i}`}
            aria-label={`Ir para banner ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 transition-all duration-300 ${i === index ? "w-8 bg-white" : "w-4 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
