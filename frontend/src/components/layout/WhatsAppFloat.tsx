import { SiWhatsapp } from "@icons-pack/react-simple-icons";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/554733794412?text=Ol%C3%A1%2C%20sou%20cliente%20do%20site%20GATABAKANA%20e%20gostaria%20de%20aux%C3%ADlio%20na%20minha%20compra."
      target="_blank"
      rel="noreferrer"
      data-testid="whatsapp-float-button"
      aria-label="Falar com o atendimento Gatabakana no WhatsApp"
      title="Atendimento Gatabakana"
      className="fixed bottom-4 right-4 z-40 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
      style={{ height: 52, width: 52 }}
    >
      <SiWhatsapp size={28} color="#FFFFFF" />
    </a>
  );
}
