"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { useLocation } from "@/components/store/LocationProvider";
import { useLiveQuote } from "@/components/store/useLiveQuote";
import { money } from "@/lib/catalog";
import SewnLabel from "@/components/store/SewnLabel";
import { trackEvent } from "@/lib/telemetry-client";

type Done = { id: string; total: number; whatsapp: string | null };
type Step = "contact" | "address" | "payment";

const STEPS: { id: Step; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "address", label: "Delivery" },
  { id: "payment", label: "Payment" },
];

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CheckoutClient({ trialNights }: { trialNights: number }) {
  const { items, subtotal, clearCart, hydrated } = useCart();
  const { total, stale, dropped } = useLiveQuote(true);
  const { pin, info, check } = useLocation();
  const [step, setStep] = useState<Step>("contact");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pincode: pin,
    address: "",
    landmark: "",
    city: "",
    state: "",
    notes: "",
    website: "",
  });
  const [payment, setPayment] = useState<"pay_on_delivery" | "upi_link">("pay_on_delivery");
  const [accept, setAccept] = useState(false);
  const [waUpdates, setWaUpdates] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const key = useRef(newKey());
  const started = useRef(false);

  useEffect(() => {
    if (hydrated && items.length && !started.current) {
      started.current = true;
      trackEvent("checkout_start", { itemCount: items.length, value: subtotal });
    }
  }, [hydrated, items.length, subtotal]);

  // Prefill from the signed-in account.
  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.customer) {
          setForm((f) => ({
            ...f,
            name: f.name || d.customer.name || "",
            email: f.email || d.customer.email || "",
            phone: f.phone || (d.customer.mobile || "").replace(/^\+?91/, ""),
          }));
        }
      })
      .catch(() => {});
  }, []);

  // PIN → city/state autofill.
  useEffect(() => {
    if (info?.ok && info.pin === form.pincode && info.place) {
      setForm((f) => ({ ...f, city: f.city || info.place!.city, state: f.state || info.place!.state }));
    }
  }, [info, form.pincode]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const shown = total ?? subtotal;
  const phoneDigits = form.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

  const stepValid = useMemo(
    () => ({
      contact: form.name.trim().length >= 2 && /^[6-9]\d{9}$/.test(phoneDigits) && (!form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)),
      address: /^[1-9]\d{5}$/.test(form.pincode) && form.address.trim().length >= 8 && form.city.trim().length >= 2 && info?.ok !== false,
      payment: accept,
    }),
    [form, phoneDigits, accept, info]
  );

  function go(next: Step) {
    setError("");
    setStep(next);
    trackEvent("checkout_step", { step: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextFrom(current: Step) {
    if (!stepValid[current]) {
      setError(
        current === "contact"
          ? "Enter your name and a 10-digit mobile number."
          : "Enter a full address and a PIN code we deliver to."
      );
      return;
    }
    go(current === "contact" ? "address" : "payment");
  }

  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!stepValid.contact) return go("contact");
    if (!stepValid.address) return go("address");
    if (!accept) {
      setError("Tick the box to accept the Terms of Sale.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: phoneDigits,
          email: form.email,
          address: [form.address, form.landmark && `Landmark: ${form.landmark}`].filter(Boolean).join(", "),
          city: [form.city, form.state].filter(Boolean).join(", "),
          pincode: form.pincode,
          notes: form.notes,
          website: form.website,
          payment,
          acceptTerms: true,
          whatsappUpdates: waUpdates,
          idempotencyKey: key.current,
          items: items.map((i) => ({ slug: i.slug, size: i.size, height: i.height, variant: i.variant, quantity: i.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "We couldn't place the order. Please try again or call us.");
      trackEvent("order_created", { value: data.total, itemCount: items.length, label: payment });
      setDone({ id: data.id, total: data.total, whatsapp: data.whatsapp || null });
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="g-receipt" role="status">
        <SewnLabel
          tone="white"
          title={
            <>
              Order placed
              <small>Keep this label — it&apos;s your receipt</small>
            </>
          }
          rows={[
            ["Order number", <b key="id">{done.id}</b>],
            ["Placed on", new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
            ["For", form.name],
            ["Deliver to", `${form.city}${form.state ? `, ${form.state}` : ""} ${form.pincode}`],
            ["Total", `${money(done.total)} incl. GST and delivery`],
            ["Payment", payment === "upi_link" ? "UPI link after confirmation" : "Pay on delivery"],
            ["Trial", `${trialNights} nights from delivery`],
          ]}
        />
        <p style={{ margin: 0, color: "var(--g-ink-2)" }}>
          We&apos;ll call you on {phoneDigits} to confirm your delivery date before anything is dispatched. Nothing is
          charged until then.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {done.whatsapp ? (
            <a href={done.whatsapp} target="_blank" rel="noopener noreferrer" className="g-btn">
              Send the order to us on WhatsApp
            </a>
          ) : null}
          <Link href="/track-order" className="g-btn g-btn--ghost">
            Track this order
          </Link>
        </div>
      </div>
    );
  }

  if (hydrated && !items.length) {
    return (
      <div className="g-empty" style={{ marginBlock: 40 }}>
        <h1 className="g-h3">Your cart is empty</h1>
        <p>Add a mattress first, then come back here to check out.</p>
        <Link href="/mattresses" className="g-btn">
          Shop mattresses
        </Link>
      </div>
    );
  }

  const idx = STEPS.findIndex((s) => s.id === step);

  return (
    <form className="g-checkout" onSubmit={placeOrder} noValidate>
      <div>
        <h1 className="g-h2" style={{ marginBottom: 18 }}>
          Checkout
        </h1>
        <ol className="g-checkout-steps">
          {STEPS.map((s, i) => (
            <li key={s.id} aria-current={s.id === step ? "step" : undefined} data-done={i < idx}>
              {i < idx ? (
                <button type="button" className="g-link" style={{ color: "inherit" }} onClick={() => go(s.id)}>
                  {s.label}
                </button>
              ) : (
                s.label
              )}
            </li>
          ))}
        </ol>

        {step === "contact" ? (
          <fieldset className="g-fieldset">
            <legend>Who&apos;s it for?</legend>
            <label className="g-field">
              <span>Full name</span>
              <input value={form.name} onChange={set("name")} required maxLength={80} autoComplete="name" />
            </label>
            <div className="g-row-2">
              <label className="g-field">
                <span>Mobile number</span>
                <input
                  value={form.phone}
                  onChange={set("phone")}
                  required
                  type="tel"
                  inputMode="tel"
                  maxLength={14}
                  autoComplete="tel-national"
                  placeholder="10 digits"
                />
                <small>We call this number to confirm delivery.</small>
              </label>
              <label className="g-field">
                <span>Email (optional)</span>
                <input value={form.email} onChange={set("email")} type="email" maxLength={120} autoComplete="email" />
                <small>For the order receipt.</small>
              </label>
            </div>
            <div className="g-hp" aria-hidden="true">
              <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
            </div>
            <button type="button" className="g-btn g-btn--block" onClick={() => nextFrom("contact")}>
              Continue to delivery
            </button>
          </fieldset>
        ) : null}

        {step === "address" ? (
          <fieldset className="g-fieldset">
            <legend>Where should it go?</legend>
            <div className="g-row-2">
              <label className="g-field">
                <span>PIN code</span>
                <input
                  value={form.pincode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForm((f) => ({ ...f, pincode: v, ...(v.length === 6 && v !== f.pincode ? { city: "", state: "" } : {}) }));
                    if (v.length === 6) void check(v);
                  }}
                  required
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="postal-code"
                />
                {info && info.pin === form.pincode ? (
                  info.ok ? (
                    <small style={{ color: "var(--g-ok)", fontWeight: 600 }}>
                      We deliver here{info.minDays != null ? ` in about ${info.minDays}–${info.maxDays} days` : ""}.
                    </small>
                  ) : (
                    <small style={{ color: "var(--g-err)", fontWeight: 600 }}>
                      {info.reason === "invalid" ? "Check the PIN code." : "We can't deliver here yet — call us and we'll try."}
                    </small>
                  )
                ) : null}
              </label>
              <label className="g-field">
                <span>City / town</span>
                <input value={form.city} onChange={set("city")} required maxLength={60} autoComplete="address-level2" />
              </label>
            </div>
            <label className="g-field">
              <span>House, street, area</span>
              <textarea value={form.address} onChange={set("address")} required maxLength={240} autoComplete="street-address" />
            </label>
            <div className="g-row-2">
              <label className="g-field">
                <span>Landmark (optional)</span>
                <input value={form.landmark} onChange={set("landmark")} maxLength={80} />
              </label>
              <label className="g-field">
                <span>State</span>
                <input value={form.state} onChange={set("state")} maxLength={40} autoComplete="address-level1" />
              </label>
            </div>
            <label className="g-field">
              <span>Anything the delivery team should know? (optional)</span>
              <input value={form.notes} onChange={set("notes")} maxLength={300} placeholder="Floor, lift, narrow stairs, best time to call" />
            </label>
            <button type="button" className="g-btn g-btn--block" onClick={() => nextFrom("address")}>
              Continue to payment
            </button>
          </fieldset>
        ) : null}

        {step === "payment" ? (
          <fieldset className="g-fieldset">
            <legend>How would you like to pay?</legend>
            <div className="g-choices" role="radiogroup" aria-label="Payment method" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button
                type="button"
                role="radio"
                aria-checked={payment === "pay_on_delivery"}
                className="g-choice"
                onClick={() => setPayment("pay_on_delivery")}
              >
                <b>Pay on delivery</b>
                <small>Cash or UPI when the mattress arrives</small>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={payment === "upi_link"}
                className="g-choice"
                onClick={() => setPayment("upi_link")}
              >
                <b>UPI payment link</b>
                <small>We send a secure link after confirming your order</small>
              </button>
            </div>
            <p className="g-note" style={{ textAlign: "left", margin: 0 }}>
              No payment is taken on this page. We&apos;ll never ask for your card number, OTP or UPI PIN on a call.
            </p>

            <label className="g-check">
              <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} required />
              <span>
                I agree to the{" "}
                <Link href="/policies/terms" className="g-link" target="_blank">
                  Terms of Sale
                </Link>{" "}
                and have read the{" "}
                <Link href="/policies/privacy" className="g-link" target="_blank">
                  Privacy Notice
                </Link>
                . My details are used only to deliver this order.
              </span>
            </label>
            <label className="g-check">
              <input type="checkbox" checked={waUpdates} onChange={(e) => setWaUpdates(e.target.checked)} />
              <span>Send me order and delivery updates on WhatsApp (optional).</span>
            </label>

            <button type="submit" className="g-btn g-btn--orange g-btn--block" disabled={sending} data-busy={sending || undefined}>
              {sending ? "Placing your order…" : `Place order, ${money(shown)}`}
            </button>
          </fieldset>
        ) : null}

        {error ? (
          <p className="g-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <aside className="g-summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Order summary</h2>
        {items.map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--g-line)" }}>
            <div>
              <b>
                {i.name} × {i.quantity}
              </b>
              <div style={{ fontSize: ".86rem", color: "var(--g-ink-2)" }}>
                {i.size}, {i.height}
                {i.variant ? `, ${i.variant}` : ""}
              </div>
            </div>
            <span>{money(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="g-totals" style={{ marginTop: 14 }}>
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
        {stale ? (
          <p className="g-note" style={{ textAlign: "left" }}>
            {dropped ? "An item in your cart is no longer available and was left out. " : ""}The total shows today&apos;s price.
          </p>
        ) : null}
        <p className="g-note" style={{ textAlign: "left" }}>
          {trialNights} nights to decide, from the day it&apos;s delivered.{" "}
          <Link href="/policies/trial" className="g-link">
            Trial terms
          </Link>
        </p>
      </aside>
    </form>
  );
}
