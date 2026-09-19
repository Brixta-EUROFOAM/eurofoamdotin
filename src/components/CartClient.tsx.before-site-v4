"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { money } from "@/lib/catalog";

export default function CartClient() {
  const { items, removeItem, changeQty, subtotal } = useCart();

  return (
    <main className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
      <h1 className="font-display text-6xl sm:text-7xl">
        Your cart.
      </h1>

      {!items.length ? (
        <div className="mt-10 rounded-[2rem] bg-white p-10 text-center">
          <p className="text-lg text-ink/60">
            Your cart is empty.
          </p>

          <Link
            href="/mattresses"
            className="mt-6 inline-flex rounded-full bg-gold px-6 py-4 text-sm font-black text-ink"
          >
            SHOP MATTRESSES
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="grid gap-5 rounded-[2rem] border border-ink/10 bg-white p-5 sm:grid-cols-[150px_1fr]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="aspect-square w-full rounded-[1.4rem] object-cover"
                />

                <div className="flex flex-col justify-between">
                  <div className="flex justify-between gap-5">
                    <div>
                      <h2 className="font-display text-3xl">
                        {item.name}
                      </h2>

                      <p className="mt-1 text-sm text-ink/50">
                        {item.size} · {item.height}
                      </p>
                    </div>

                    <strong>
                      {money(item.price * item.quantity)}
                    </strong>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          changeQty(item.id, item.quantity - 1)
                        }
                        className="h-9 w-9 rounded-full border border-ink/15"
                      >
                        −
                      </button>

                      <span className="w-8 text-center font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          changeQty(item.id, item.quantity + 1)
                        }
                        className="h-9 w-9 rounded-full border border-ink/15"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-bold text-gold-dark"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-[2rem] bg-ink p-7 text-white">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-gold">
              Order summary
            </p>

            <div className="mt-6 flex justify-between text-sm text-white/60">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            <div className="mt-3 flex justify-between text-sm text-white/60">
              <span>Shipping</span>
              <span>FREE</span>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-end justify-between">
                <span className="font-bold">Total</span>
                <span className="font-display text-3xl">
                  {money(subtotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                alert(
                  "Demo only — connect Razorpay/Shopify checkout here."
                )
              }
              className="mt-7 w-full rounded-full bg-gold px-5 py-4 text-sm font-black text-ink"
            >
              CHECKOUT
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-white/40">
              Checkout is currently a demo.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}