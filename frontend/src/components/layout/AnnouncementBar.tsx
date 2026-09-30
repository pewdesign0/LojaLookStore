const MESSAGES = [
  "PARCELE EM ATÉ 6X SEM JUROS NO CARTÃO",
  "CUPOM GBVIP: 10% OFF NA PRIMEIRA COMPRA",
  "PAGUE NO PIX E GANHE 5% DE DESCONTO",
  "FRETE GRÁTIS ACIMA DE R$ 499 — SC, SP, MG, PR, RS E RJ",
];

export default function AnnouncementBar() {
  const row = [...MESSAGES, ...MESSAGES];
  return (
    <div data-testid="announcement-bar" className="overflow-hidden bg-[#111111] py-2 text-white">
      <div className="flex w-max animate-marquee gap-0">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
            {row.map((message, i) => (
              <span
                key={`${half}-${i}`}
                className="flex items-center gap-6 whitespace-nowrap px-6 text-[11px] font-medium uppercase tracking-[0.18em]"
              >
                {message}
                <span className="text-[#FACC15]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
