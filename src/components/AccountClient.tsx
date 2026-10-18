"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { money } from "@/lib/catalog";

type Customer = { id: string; name: string; email: string; mobile: string };
type OrderRow = {
  id: string;
  createdAt: string;
  status: string;
  statusLabel?: string;
  total: number;
  payment: string;
  lines: { name: string; size: string; height: string; variant?: string; quantity: number }[];
};

const STATUS: Record<string, string> = {
  new: "Received — we'll call to confirm",
  confirmed: "Confirmed",
  dispatched: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AccountClient() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  return (
    <div className="g-narrow" style={{ marginInline: "auto", paddingBlock: 48 }}>
      <h1 className="g-h2" style={{ marginBottom: 8 }}>
        {mode === "login" ? "Sign in" : "Create an account"}
      </h1>
      <p className="g-lede" style={{ marginBottom: 24 }}>
        You don&apos;t need an account to order. It just keeps your orders in one place and fills in checkout for you.
      </p>
      <div className="g-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => setMode("register")}>
          Create account
        </button>
      </div>
      <form className="g-card-flat" style={{ display: "grid", gap: 14 }} onSubmit={submit}>
        {mode === "register" ? (
          <>
            <label className="g-field">
              <span>Full name</span>
              <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
            </label>
            <label className="g-field">
              <span>Mobile (optional)</span>
              <input name="mobile" type="tel" inputMode="tel" maxLength={14} autoComplete="tel" />
            </label>
          </>
        ) : null}
        <label className="g-field">
          <span>Email</span>
          <input name="email" type="email" required maxLength={120} autoComplete="email" />
        </label>
        <label className="g-field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={200}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {mode === "register" ? <small>At least 8 characters.</small> : null}
        </label>
        {mode === "register" ? (
          <p className="g-note" style={{ textAlign: "left", margin: 0 }}>
            By creating an account you agree to the <Link href="/policies/terms" className="g-link">Terms</Link> and{" "}
            <Link href="/policies/privacy" className="g-link">Privacy Notice</Link>.
          </p>
        ) : null}
        {error ? (
          <p className="g-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="g-btn g-btn--block" disabled={busy}>
          {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
