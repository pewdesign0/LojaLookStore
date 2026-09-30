// Wishlist state: slugs persisted to localStorage, shared via context.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const KEY = "gata-favorites-v1";

interface FavoritesState {
  slugs: string[];
  count: number;
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => boolean; // returns the new state (true = added)
}

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  }, [slugs]);

  const isFavorite = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback(
    (slug: string) => {
      const adding = !slugs.includes(slug);
      setSlugs((prev) => (adding ? [...prev, slug] : prev.filter((s) => s !== slug)));
      return adding;
    },
    [slugs],
  );

  const value = useMemo<FavoritesState>(
    () => ({ slugs, count: slugs.length, isFavorite, toggle }),
    [slugs, isFavorite, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
