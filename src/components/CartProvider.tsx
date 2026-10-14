"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  height: string;
  /* Chosen upgrades, e.g. "Pocket springs". */
  variant?: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  changeQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nova-cart");
      if (raw) setItems(JSON.parse(raw));
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("nova-cart", JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(item: CartItem) {
    setItems((current) => {
      const found = current.find((entry) => entry.id === item.id);
      if (found) {
        return current.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry
        );
      }
      return [...current, item];
    });
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function changeQty(id: string, quantity: number) {
    if (quantity <= 0) return removeItem(id);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      changeQty,
      clearCart: () => setItems([]),
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
