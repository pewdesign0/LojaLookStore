import { useState } from "react";
import { toast } from "sonner";
import { PackageCheck, Truck } from "lucide-react";
import { cepInfo, formatBRL, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface ShippingCalculatorProps {
  /** Order value used to decide the free-shipping threshold. */
  subtotal: number;
  testIdPrefix?: string;
}

type Result = NonNullable<ReturnType<typeof cepInfo>> & { shipping: number };

// Shared CEP/freight widget — used on the product page and in the cart.
export default function ShippingCalculator({ subtotal, testIdPrefix = "shipping" }: ShippingCalculatorProps) {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const calculate = () => {
    const info = cepInfo(cep, subtotal);
    if (!info) {
      toast.error("Informe um CEP válido com 8 dígitos.");
      return;
    }
    setResult({ ...info, shipping: info.freeEligible ? 0 : STANDARD_SHIPPING });
  };

  return (
    <div className="border border-stone-200 p-4" data-testid={`${testIdPrefix}-calculator`}>
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
        <Truck className="h-4 w-4" /> Calcular frete e prazo
      </p>
      <div className="mt-3 flex gap-2">
        <input
          data-testid={`${testIdPrefix}-cep-input`}
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              calculate();
            }
          }}
          placeholder="CEP (ex.: 88015000)"
          inputMode="numeric"
          aria-label="Informe seu CEP"
          className="w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-foreground"
        />
        <Button variant="outline" data-testid={`${testIdPrefix}-cep-calculate-button`} onClick={calculate}>
          Calcular
        </Button>
      </div>
      {result && (
        <div className="mt-3 space-y-1.5 text-xs text-stone-600" data-testid={`${testIdPrefix}-cep-result`}>
          <p className="font-medium text-foreground">
            {result.region} — {cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
          </p>
          <p className="flex items-center gap-1.5">
            <PackageCheck className="h-3.5 w-3.5 text-green-700" />
            {result.shipping === 0
              ? `PAC — GRÁTIS (compra acima de ${formatBRL(FREE_SHIPPING_THRESHOLD)})`
              : `PAC — ${formatBRL(result.shipping)} · ${result.pacDays} dias úteis`}
          </p>
          <p>Sedex — R$ 34,90 · {result.sedexDays} dias úteis</p>
        </div>
      )}
    </div>
  );
}
