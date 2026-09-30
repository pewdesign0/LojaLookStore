import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import SearchOverlay from "@/components/layout/SearchOverlay";
import { NAV_LINKS } from "@/components/layout/navLinks";

export default function Header() {
  const { count, setDrawerOpen } = useCart();
  const { count: favoritesCount } = useFavorites();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: mobile menu / desktop nav */}
        <div className="flex items-center">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              data-testid="header-mobile-menu-button"
              aria-label="Abrir menu de navegação"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="font-heading text-xl tracking-wide">GATABAKANA</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`px-2 py-2.5 text-xs font-medium uppercase tracking-[0.15em] hover:text-brand ${
                      link.highlight ? "text-brand" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/favoritos"
                  onClick={() => setMenuOpen(false)}
                  className="px-2 py-2.5 text-xs font-medium uppercase tracking-[0.15em] hover:text-brand"
                >
                  Favoritos
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <nav className="hidden items-center gap-5 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className={({ isActive }) =>
                  `border-b-2 pb-0.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors hover:text-brand ${
                    isActive ? "border-brand text-brand" : "border-transparent text-stone-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: logo */}
        <Link to="/" data-testid="header-logo-link" className="px-4 text-center">
          <span className="font-heading text-2xl font-semibold tracking-[0.12em] sm:text-3xl">
            GATABAKANA
          </span>
        </Link>

        {/* Right: search + favorites + cart */}
        <div className="flex items-center justify-end gap-4">
          <button
            data-testid="header-search-button"
            aria-label="Buscar produtos"
            onClick={() => setSearchOpen(true)}
            className="transition-colors hover:text-brand"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            to="/favoritos"
            data-testid="header-favorites-link"
            aria-label="Ver meus favoritos"
            className="relative transition-colors hover:text-brand"
          >
            <Heart className="h-5 w-5" />
            {favoritesCount > 0 && (
              <span
                data-testid="header-favorites-count-badge"
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
              >
                {favoritesCount}
              </span>
            )}
          </Link>
          <button
            data-testid="header-cart-button"
            aria-label="Abrir sacola de compras"
            onClick={() => setDrawerOpen(true)}
            className="relative transition-colors hover:text-brand"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span
                data-testid="header-cart-count-badge"
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <SearchOverlay
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={(q) => navigate(`/busca?q=${encodeURIComponent(q)}`)}
      />
    </header>
  );
}
