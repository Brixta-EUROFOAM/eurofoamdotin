"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trackEvent } from "@/lib/telemetry-client";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  height: string;
  /* Chosen upgrades, e.g. "Pocket springs". */
  variant?: string;
  /* Display price only — the server re-prices every order from the catalogue. */
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem, opts?: { open?: boolean }) => void;
  removeItem: (id: string) => void;
  changeQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  hydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  bump: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "nova-cart";
const MAX_QTY = 10;

function sanitize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((i) => i && typeof i.id === "string" && typeof i.slug === "string")
    .slice(0, 20)
    .map((i) => ({
      id: String(i.id).slice(0, 200),
      slug: String(i.slug).slice(0, 120),
      name: String(i.name || "").slice(0, 120),
      image: String(i.image || "").slice(0, 500),
      size: String(i.size || "").slice(0, 40),
      height: String(i.height || "").slice(0, 40),
      variant: i.variant ? String(i.variant).slice(0, 120) : undefined,
      price: Math.max(0, Number(i.price) || 0),
      quantity: Math.max(1, Math.min(MAX_QTY, Math.floor(Number(i.quantity) || 1))),
    }));
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(sanitize(JSON.parse(raw)));
    } catch {
    } finally {
      setHydrated(true);
    }
    // keep tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        try {
          setItems(sanitize(JSON.parse(e.newValue || "[]")));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem, opts: { open?: boolean } = {}) => {
    setItems((current) => {
      const found = current.find((entry) => entry.id === item.id);
      if (found) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: Math.min(MAX_QTY, entry.quantity + item.quantity) } : entry
        );
      }
      return [...current, item];
    });
    setBump((n) => n + 1);
    trackEvent("add_to_cart", {
      productSlug: item.slug,
      value: item.price * item.quantity,
      quantity: item.quantity,
      label: `${item.size} ${item.height}`,
    });
    if (opts.open !== false) setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      const gone = current.find((i) => i.id === id);
      if (gone) trackEvent("remove_from_cart", { productSlug: gone.slug, value: gone.price * gone.quantity });
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const changeQty = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) return removeItem(id);
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, quantity: Math.min(MAX_QTY, quantity) } : item))
      );
      trackEvent("cart_quantity", { quantity });
    },
    [removeItem]
  );

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    trackEvent("cart_open");
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      changeQty,
      clearCart: () => setItems([]),
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      hydrated,
      drawerOpen,
      openDrawer,
      closeDrawer: () => setDrawerOpen(false),
      bump,
    }),
    [items, addItem, removeItem, changeQty, hydrated, drawerOpen, openDrawer, bump]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
