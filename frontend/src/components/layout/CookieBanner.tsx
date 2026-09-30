import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "gata-cookie-consent-v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  return (
    <div
      data-testid="cookie-consent-banner"
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 border border-stone-200 bg-white/95 p-4 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div>
          <p className="text-xs leading-relaxed text-stone-700">
            Usamos cookies no site para dar a você uma melhor experiência de compra. Para continuar
            navegando, é só clicar no botão. Saiba mais na nossa{" "}
            <Link to="#" className="underline underline-offset-2">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-3 flex gap-2">
            <Button data-testid="cookie-accept-button" size="sm" onClick={accept}>
              Aceitar todos os Cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
