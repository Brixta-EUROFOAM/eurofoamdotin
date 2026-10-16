"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";

/*
  Re-prices the cart on the server so the shopper always sees today's
  price (and the same number the order will be charged at).
*/
export function useLiveQuote(active = true) {
  const { items, hydrated } = useCart();
  const [total, setTotal] = useState<number | null>(null);
  const [stale, setStale] = useState(false);
  const [dropped, setDropped] = useState(0);

  const key = items.map((i) => `${i.id}:${i.quantity}`).join("|");

  useEffect(() => {
    if (!active || !hydrated || !items.length) {
      setTotal(null);
      setStale(false);
      setDropped(0);
      return;
    }
    const ctrl = new AbortController();
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        items: items.map((i) => ({ slug: i.slug, size: i.size, height: i.height, variant: i.variant, quantity: i.quantity })),
      }),
    })
      .then((r) => r.json())
      .then((data: { total?: number; lines?: unknown[] }) => {
        if (typeof data.total !== "number") return;
        const local = items.reduce((s, i) => s + i.price * i.quantity, 0);
        setTotal(data.total);
        setStale(data.total !== local);
        setDropped(items.length - (data.lines?.length ?? items.length));
      })
      .catch(() => {});
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active, hydrated]);

  return { total, stale, dropped };
}
