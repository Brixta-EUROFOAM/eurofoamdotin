"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/CartProvider";
import { useLocation } from "@/components/store/LocationProvider";
import { useLiveQuote } from "@/components/store/useLiveQuote";
import { IconClose, IconPin } from "@/components/store/Icons";
import NeedleArt from "@/components/store/NeedleArt";
import { money } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";

export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, changeQty, removeItem, subtotal, count } = useCart();
  const { info, eta, openPicker } = useLocation();
  const { total, stale } = useLiveQuote(drawerOpen);
  const pathname = usePathname();
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen || pathname.startsWith("/admin")) return null;

  const shown = total ?? subtotal;

  return (
    <>
      <div className="g-drawer-backdrop" onClick={closeDrawer} />
      <aside
        ref={panel}
        tabIndex={-1}
        className="g-drawer g-drawer--right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="g-drawer-head">
          <h2 id="cart-title">Your cart{count ? ` (${count})` : ""}</h2>
          <button type="button" className="g-icon-btn" aria-label="Close cart" onClick={closeDrawer}>
            <IconClose />
          </button>
        </div>

        <div className="g-drawer-body">
          {items.length === 0 ? (
            <div className="g-empty" style={{ border: 0, padding: 0 }}>
              <NeedleArt width={180} />
              <h3 className="g-h3">Nothing in here yet</h3>
              <p>Three mattresses, one honest price each. Pick one and it&apos;ll wait here for you.</p>
              <Link href="/mattresses" className="g-btn" onClick={closeDrawer}>
                Shop mattresses
              </Link>
              <Link href="/sleep-quiz" className="g-link" onClick={closeDrawer}>
                Not sure? Take the 60-second quiz
              </Link>
            </div>
          ) : (
            <>
              <button type="button" className="g-pin-row" onClick={openPicker} style={{ width: "100%", border: 0, cursor: "pointer", textAlign: "left" }}>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <IconPin width={18} height={18} />
                  {info?.ok && eta ? (
                    <span>
                      Arrives <b>{eta}</b> to {info.pin}
                    </span>
                  ) : (
                    <span>Add your PIN code for a delivery date</span>
                  )}
                </span>
                <span style={{ textDecoration: "underline" }}>{info?.ok ? "Change" : "Add"}</span>
              </button>

              {items.map((item) => (
                <div className="g-line" key={item.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image || "/layers/gadda/comfort.webp"} alt="" />
                  <div>
                    <div className="g-line-top">
                      <Link href={`/mattresses/${item.slug}`} onClick={closeDrawer}>
                        {item.name}
                      </Link>
                      <b>{money(item.price * item.quantity)}</b>
                    </div>
                    <p className="g-line-spec">
                      {item.size}, {item.height}
                      {item.variant ? `, ${item.variant}` : ""}
                    </p>
                    <div className="g-line-row">
                      <div className="g-qty" role="group" aria-label={`Quantity of ${item.name}`}>
                        <button type="button" aria-label="One less" onClick={() => changeQty(item.id, item.quantity - 1)}>
                          −
                        </button>
                        <output aria-live="polite">{item.quantity}</output>
                        <button
                          type="button"
                          aria-label="One more"
                          disabled={item.quantity >= 10}
                          onClick={() => changeQty(item.id, item.quantity + 1)}
                        >
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

              {stale ? (
                <p className="g-note" role="status" style={{ textAlign: "left" }}>
                  A price changed since you added this. The total below is today&apos;s price.
                </p>
              ) : null}
            </>
          )}
        </div>

        {items.length ? (
          <div className="g-drawer-foot">
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
            <Link href="/checkout" className="g-btn g-btn--orange g-btn--block" onClick={closeDrawer}>
              Checkout
            </Link>
            <p className="g-note">
              Pay on delivery or by UPI. {BUSINESS.trialNights} nights to decide.
            </p>
          </div>
        ) : null}
      </aside>
    </>
  );
}
