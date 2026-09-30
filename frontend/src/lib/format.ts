// Store formatting + shared pricing constants (mirrors backend/lib/pricing.py — keep in sync).

export const FREE_SHIPPING_THRESHOLD = 499;
export const STANDARD_SHIPPING = 24.9;
export const PIX_DISCOUNT_RATE = 0.05;
export const COUPON_RATE = 0.1; // GBVIP
export const FREE_SHIPPING_STATES = new Set(["SC", "SP", "PR", "RS", "MG", "RJ"]);

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const formatInstallments = (value: number, n = 6): string => formatBRL(value / n);

export const discountPct = (price: number, oldPrice: number | null): number | null =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;

export interface CepInfo {
  region: string;
  pacDays: number;
  sedexDays: number;
  freeEligible: boolean;
}

export function cepInfo(cep: string, subtotal: number): CepInfo | null {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const first = parseInt(digits[0], 10);
  if (first <= 3) {
    return { region: "Sudeste", pacDays: 5, sedexDays: 2, freeEligible: subtotal >= FREE_SHIPPING_THRESHOLD };
  }
  if (first >= 8) {
    return { region: "Sul", pacDays: 4, sedexDays: 2, freeEligible: subtotal >= FREE_SHIPPING_THRESHOLD };
  }
  return { region: "Nordeste / Centro-Oeste / Norte", pacDays: 9, sedexDays: 4, freeEligible: false };
}
