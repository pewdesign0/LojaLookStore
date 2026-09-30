import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { NAV_LINKS } from "@/components/layout/Header";

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
}

export default function SearchOverlay({ open, onOpenChange, onSearch }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    onOpenChange(false);
    onSearch(q);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogTitle className="font-heading text-xl">O que você procura?</DialogTitle>
        <form
          className="mt-4 flex items-center gap-2 border-b border-stone-300 pb-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Search className="h-4 w-4 shrink-0 text-stone-400" />
          <input
            data-testid="search-overlay-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vestido, jeans, bikini..."
            autoFocus
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
          <button
            type="submit"
            data-testid="search-overlay-submit-button"
            className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-800 transition-colors hover:text-brand"
          >
            Buscar
          </button>
        </form>
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-stone-500">
            Buscas populares
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.to}
                data-testid={`search-overlay-suggestion-${link.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                onClick={() => {
                  onOpenChange(false);
                  navigate(link.to);
                }}
                className="border border-stone-200 px-3 py-1.5 text-xs uppercase tracking-wide text-stone-700 transition-colors hover:border-brand hover:text-brand"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
