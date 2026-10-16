"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useLocation } from "@/components/store/LocationProvider";
import { useLiveQuote } from "@/components/store/useLiveQuote";
import { money } from "@/lib/catalog";

export default function CartClient() {
  const { items, changeQty, removeItem, subtotal, hydrated } = useCart();
  const { total, stale } = useLiveQuote(true);
  const { info, eta, openPicker } = useLocation();
  const shown = total ?? subtotal;

  if (!hydrated) return <div style={{ minHeight: 320 }} />;

  if (!items.length) {
    return (
      <div className="g-empty" style={{ marginBlock: 40 }}>
        <h1 className="g-h3">Your cart is empty</h1>
        <p>Three mattresses, one honest price each. Pick one and it&apos;ll wait here.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/mattresses" className="g-btn">
            Shop mattresses
          </Link>
          <Link href="/sleep-quiz" className="g-btn g-btn--ghost">
            Take the quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="g-checkout">
      <div>
        <h1 className="g-h2" style={{ marginBottom: 20 }}>
          Your cart
        </h1>
        <div className="g-card-flat">
          {items.map((item) => (
            <div className="g-line" key={item.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image || "/layers/gadda/comfort.webp"} alt="" />
              <div>
                <div className="g-line-top">
                  <Link href={`/mattresses/${item.slug}`}>{item.name}</Link>
                  <b>{money(item.price * item.quantity)}</b>
                </div>
                <p className="g-line-spec">
                  {item.size}, {item.height}
                  {item.variant ? `, ${item.variant}` : ""} — {money(item.price)} each
                </p>
                <div className="g-line-row">
                  <div className="g-qty" role="group" aria-label={`Quantity of ${item.name}`}>
                    <button type="button" aria-label="One less" onClick={() => changeQty(item.id, item.quantity - 1)}>
                      −
                    </button>
                    <output>{item.quantity}</output>
                    <button type="button" aria-label="One more" onClick={() => changeQty(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button type="button" className="g-remove" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16 }}>
          <Link href="/mattresses" className="g-link">
            Keep shopping
          </Link>
        </p>
      </div>

      <aside className="g-summary" aria-labelledby="cart-summary">
        <h2 id="cart-summary">Summary</h2>
        <button type="button" className="g-pin-row" onClick={openPicker} style={{ width: "100%", border: 0, cursor: "pointer", textAlign: "left" }}>
          <span>{info?.ok && eta ? <>Arrives {eta}</> : "Add PIN code for a delivery date"}</span>
          <span style={{ textDecoration: "underline" }}>{info?.ok ? info.pin : "Add"}</span>
        </button>
        <div className="g-totals">
          <div>
            <span>Subtotal</span>
            <span>{money(shown)}</span>
          </div>
          <div>
            <span>Delivery</span>
            <span className="g-ok">Included</span>
          </div>
          <div className="g-totals-grand">
            <span>
              Total <small>(incl. GST)</small>
            </span>
            <span>{money(shown)}</span>
          </div>
        </div>
        {stale ? <p className="g-note">A price changed since you added it. This is today&apos;s total.</p> : null}
        <Link href="/checkout" className="g-btn g-btn--orange g-btn--block">
          Checkout
        </Link>
        <p className="g-note">Pay on delivery or by UPI link. Nothing is charged online.</p>
      </aside>
    </div>
  );
}
