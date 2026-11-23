"use client";

import Link from "next/link";
import OtpAccountAccess from "@/components/store/OtpAccountAccess";
import PhoneCodeAccess from "@/components/store/PhoneCodeAccess";
import { useEffect, useState, type FormEvent } from "react";
import { money } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";

type Customer = { id: string; name: string; email: string; mobile: string };
type OrderRow = {
  id: string;
  createdAt: string;
  status: string;
  statusLabel?: string;
  total: number;
  payment: string;
  lines: { slug: string; name: string; size: string; height: string; variant?: string; quantity: number; unitPrice: number }[];
};

const STATUS: Record<string, string> = {
  new: "Received — we'll call to confirm",
  confirmed: "Confirmed",
  dispatched: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AccountClient() {
  const { addItem, openDrawer } = useCart();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [whatsappAvailable, setWhatsappAvailable] = useState(false);
  useEffect(() => {
    fetch("/api/customer/phone/status", { cache: "no-store" })
      .then((r) => r.json()).then((x) => { setOtpEnabled(x.otpEnabled === true); setWhatsappAvailable(x.whatsappAvailable === true); }).catch(() => {});
  }, []);

  async function loadOrders() {
    const r = await fetch("/api/customer/orders").catch(() => null);
    if (r?.ok) setOrders((await r.json()).orders || []);
  }

  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((b) => {
        setCustomer(b.customer || null);
        if (b.customer) void loadOrders();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    setBusy(true);
    try {
      const res = await fetch(mode === "register" ? "/api/customer/register" : "/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register"
            ? { name: f.get("name"), email: f.get("email"), mobile: f.get("mobile"), password: f.get("password") }
            : { email: f.get("email"), password: f.get("password") }
        ),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong. Try again.");
      setCustomer(body.customer);
      void loadOrders();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/customer/logout", { method: "POST" });
    setCustomer(null);
    setOrders([]);
  }

  async function erase() {
    setBusy(true);
    const r = await fetch("/api/customer/data", { method: "DELETE" });
    setBusy(false);
    if (r.ok) {
      setCustomer(null);
      setOrders([]);
      setConfirmDelete(false);
      setError("");
      alert("Your account has been deleted.");
    } else {
      setError("Couldn't delete the account. Please contact us and we'll do it for you.");
    }
  }

  function buyAgain(order: OrderRow) {
    // Restored prices are only display estimates; checkout always recalculates current prices.
    for (const line of order.lines) {
      if (!line.slug || !line.name || !line.size || !line.height) continue;
      addItem({
        id: `${line.slug}-${line.size}-${line.height}-${line.variant || "default"}`,
        slug: line.slug, name: line.name, image: "/layers/gadda/comfort.webp",
        size: line.size, height: line.height, variant: line.variant,
        quantity: line.quantity, price: line.unitPrice,
      }, { open: false });
    }
    // Cart can be reviewed before checkout; we do not silently charge the user.
    openDrawer();
  }

  if (loading) return <div style={{ minHeight: 320 }} />;

  if (customer) {
    return (
      <div style={{ display: "grid", gap: 24, paddingBlock: 40 }}>
        <div className="g-head" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="g-h2">Hi, {customer.name.split(" ")[0]}</h1>
            <p className="g-lede">
              {customer.email}
              {customer.mobile ? `, ${customer.mobile}` : ""}
            </p>
          </div>
          <button type="button" className="g-btn g-btn--ghost" onClick={logout}>
            Sign out
          </button>
        </div>

        <section className="g-card-flat" aria-labelledby="orders-h">
          <h2 className="g-h3" id="orders-h">
            Your orders
          </h2>
          {orders.length ? (
            orders.map((o) => (
              <div className="g-order" key={o.id}>
                <div className="g-order-top">
                  <b>{o.id}</b>
                  <span className={`g-chip ${o.status === "delivered" ? "g-chip--ok" : o.status === "cancelled" ? "" : "g-chip--indigo"}`}>
                    {o.statusLabel || STATUS[o.status] || o.status}
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", color: "var(--g-ink-2)", fontSize: ".93rem" }}>
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.{" "}
                  {o.lines.map((l) => `${l.name} ${l.size} ${l.height} × ${l.quantity}`).join("; ")}. {money(o.total)}
                </p>
                <button type="button" className="g-btn g-btn--ghost g-btn--sm"
                  style={{ marginTop: 10 }} onClick={() => buyAgain(o)}>Buy again — review current prices</button>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--g-ink-2)" }}>
              No orders on this account yet. Orders placed while signed out can be found with{" "}
              <Link href="/track-order" className="g-link">
                order tracking
              </Link>
              .
            </p>
          )}
        </section>

        <section className="g-card-flat" aria-labelledby="wa-phone-h" style={{ display: otpEnabled && whatsappAvailable ? undefined : "none" }}>
          <h2 className="g-h3" id="wa-phone-h">Verified WhatsApp number</h2>
          <p>Verify a WhatsApp number for your GADDA account and to receive optional order updates. Account sign-in by email remains available.</p>
          <label className="g-field"><span>Your WhatsApp number</span>
            <input type="tel" inputMode="tel" autoComplete="tel-national" value={whatsappNumber || customer.mobile}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit WhatsApp number" />
          </label>
          <PhoneCodeAccess phone={whatsappNumber || customer.mobile} onVerified={(phone) => {
            setCustomer((current) => current ? { ...current, mobile: phone } : current);
            setWhatsappNumber(phone);
          }} />
        </section>
        <section className="g-card-flat" aria-labelledby="share-h">
          <h2 className="g-h3" id="share-h">Recommend GADDA</h2>
          <p>Share our mattresses with a friend. No discount or referral reward is currently promised.</p>
          <a className="g-btn g-btn--ghost g-btn--sm" href="https://wa.me/?text=Take%20a%20look%20at%20GADDA%20mattresses%3A%20https%3A%2F%2Fgadda.store%2F%3Futm_source%3Dreferral%26utm_medium%3Dshare%26utm_campaign%3Dcustomer_recommendation"
            target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
        </section>

        <section className="g-card-flat" aria-labelledby="data-h">
          <h2 className="g-h3" id="data-h">
            Your data
          </h2>
          <p style={{ color: "var(--g-ink-2)", maxWidth: "62ch" }}>
            Under India&apos;s data protection law you can get a copy of what we hold about you, ask us to correct it, or
            delete your account. Order records are kept for tax purposes but are unlinked from you.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a className="g-btn g-btn--ghost g-btn--sm" href="/api/customer/data" download>
              Download my data
            </a>
            <Link className="g-btn g-btn--ghost g-btn--sm" href="/policies/grievance">
              Ask for a correction
            </Link>
            {confirmDelete ? (
              <>
                <button type="button" className="g-btn g-btn--sm" style={{ background: "var(--g-err)" }} disabled={busy} onClick={erase}>
                  Yes, delete my account
                </button>
                <button type="button" className="g-link" onClick={() => setConfirmDelete(false)}>
                  Keep it
                </button>
              </>
            ) : (
              <button type="button" className="g-btn g-btn--ghost g-btn--sm" onClick={() => setConfirmDelete(true)}>
                Delete my account
              </button>
            )}
          </div>
          {error ? (
            <p className="g-error" role="alert" style={{ marginTop: 10 }}>
              {error}
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  return <OtpAccountAccess onSuccess={(verified) => { setCustomer(verified); void loadOrders(); }} />;
}
