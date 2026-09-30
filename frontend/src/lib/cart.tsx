// Cart state: React context persisted to localStorage. Coupon + drawer state ride along.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  image: string;
  price: number;
  quantity: number;
}

const ITEMS_KEY = "gata-cart-items-v1";
const COUPON_KEY = "gata-cart-coupon-v1";

interface CartState {
  items: CartItem[];
  coupon: string | null;
  drawerOpen: boolean;
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (product_id: string, size: string, color: string) => void;
  updateQuantity: (product_id: string, size: string, color: string, quantity: number) => void;
  setCoupon: (code: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartState | null>(null);

const lineKey = (item: Pick<CartItem, "product_id" | "size" | "color">) =>
  `${item.product_id}|${item.size}|${item.color}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(ITEMS_KEY) ?? "[]") as CartItem[];
    } catch {
      return [];
    }
  });
  const [coupon, setCoupon] = useState<string | null>(() => localStorage.getItem(COUPON_KEY));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) localStorage.setItem(COUPON_KEY, coupon);
    else localStorage.removeItem(COUPON_KEY);
  }, [coupon]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => lineKey(i) === lineKey(item));
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === lineKey(item) ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((product_id: string, size: string, color: string) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey({ product_id, size, color })));
  }, []);

  const updateQuantity = useCallback(
    (product_id: string, size: string, color: string, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => lineKey(i) !== lineKey({ product_id, size, color }))
          : prev.map((i) => (lineKey(i) === lineKey({ product_id, size, color }) ? { ...i, quantity } : i)),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    [items],
  );

  const value: CartState = {
    items,
    coupon,
    drawerOpen,
    count,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    setCoupon,
    setDrawerOpen,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
