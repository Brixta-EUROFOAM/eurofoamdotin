"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { money, type Mattress } from "@/lib/catalog";

/* Phones only: a slim bar that appears once you scroll past the hero. */
export default function MobileBuyBar({ product }: { product?: Mattress }) {
  const { count, subtotal } = useCart();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!product) return null;

  return (
    <div className={show ? "gp-buybar is-on" : "gp-buybar"} aria-hidden={!show}>
      {count > 0 ? (
        <>
          <div>
            <small>YOUR CART · {count} ITEM{count === 1 ? "" : "S"}</small>
            <strong>{money(subtotal)}</strong>
          </div>
          <Link href="/cart" tabIndex={show ? 0 : -1}>
            CHECKOUT →
          </Link>
        </>
      ) : (
        <>
          <div>
            <small>MOST PEOPLE PICK {(product.badge || product.name).toUpperCase()}</small>
            <strong>from {money(product.basePrice)}</strong>
          </div>
          <Link href={`/mattresses/${product.slug}`} tabIndex={show ? 0 : -1}>
            SHOP NOW →
          </Link>
        </>
      )}
    </div>
  );
}
