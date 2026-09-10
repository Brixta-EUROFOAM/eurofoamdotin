"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  mobile: string;
};

export default function AccountClient() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("/api/customer/me")
      .then((response) => response.json())
      .then((body) => setCustomer(body.customer || null))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const endpoint =
        mode === "register"
          ? "/api/customer/register"
          : "/api/customer/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          mode === "register"
            ? { name, email, mobile, password }
            : { email, password }
        )
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Something went wrong.");
      }

      setCustomer(body.customer);
      window.dispatchEvent(new Event("eurofoam:account"));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/customer/logout", {
      method: "POST"
    });

    setCustomer(null);
    window.dispatchEvent(new Event("eurofoam:account"));
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-white p-8">
        Loading account…
      </div>
    );
  }

  if (customer) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-[2rem] border border-ink/10 bg-white p-7 md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#D95F0E]">
            Your Eurofoam
          </p>

          <h1 className="mt-3 font-display text-4xl">
            Hi, {customer.name.split(" ")[0]}.
          </h1>

          <div className="mt-8 space-y-5 text-sm">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.12em] text-ink/40">
                Name
              </div>
              <div className="mt-1 font-bold">{customer.name}</div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-[0.12em] text-ink/40">
                Email
              </div>
              <div className="mt-1 font-bold">{customer.email}</div>
            </div>

            {customer.mobile ? (
              <div>
                <div className="text-xs font-black uppercase tracking-[0.12em] text-ink/40">
                  Mobile
                </div>
                <div className="mt-1 font-bold">{customer.mobile}</div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-8 rounded-full border border-ink/15 px-5 py-3 text-sm font-black"
          >
            SIGN OUT
          </button>
        </section>

        <section className="space-y-4">
          <Link
            href="/cart"
            className="block rounded-[1.6rem] border border-ink/10 bg-[#FAF6E8] p-6 transition hover:border-[#FF7A00]/40"
          >
            <div className="text-xs font-black uppercase tracking-[0.12em] text-ink/40">
              Shopping
            </div>
            <div className="mt-2 font-display text-3xl">
              My Cart →
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="block rounded-[1.6rem] border border-ink/10 bg-white p-6 transition hover:border-[#FF7A00]/40"
          >
            <div className="text-xs font-black uppercase tracking-[0.12em] text-ink/40">
              Saved
            </div>
            <div className="mt-2 font-display text-3xl">
              Wishlist →
            </div>
          </Link>

          <Link
            href="/sleep-quiz"
            className="block rounded-[1.6rem] border border-ink/10 bg-white p-6 transition hover:border-[#FF7A00]/40"
          >
            <div className="text-xs font-black uppercase tracking-[0.12em] text-ink/40">
              Sleep profile
            </div>
            <div className="mt-2 font-display text-3xl">
              Find My Match →
            </div>
          </Link>
        </section>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-xl rounded-[2rem] border border-ink/10 bg-white p-7 shadow-[0_20px_60px_rgba(24,24,24,.07)] md:p-9">
      <div className="flex gap-2 rounded-full bg-[#FAF6E8] p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={`flex-1 rounded-full px-4 py-3 text-sm font-black ${
            mode === "login"
              ? "bg-white shadow-sm"
              : "text-ink/50"
          }`}
        >
          SIGN IN
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
          }}
          className={`flex-1 rounded-full px-4 py-3 text-sm font-black ${
            mode === "register"
              ? "bg-white shadow-sm"
              : "text-ink/50"
          }`}
        >
          CREATE ACCOUNT
        </button>
      </div>

      <h1 className="mt-8 font-display text-4xl">
        {mode === "login"
          ? "Welcome back."
          : "Create your Eurofoam account."}
      </h1>

      <form onSubmit={submit} className="mt-7 space-y-4">
        {mode === "register" ? (
          <>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-ink/15 px-4 py-3.5 outline-none focus:border-[#FF7A00]"
            />

            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile number"
              inputMode="tel"
              className="w-full rounded-xl border border-ink/15 px-4 py-3.5 outline-none focus:border-[#FF7A00]"
            />
          </>
        ) : null}

        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full rounded-xl border border-ink/15 px-4 py-3.5 outline-none focus:border-[#FF7A00]"
        />

        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-ink/15 px-4 py-3.5 outline-none focus:border-[#FF7A00]"
        />

        {error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <button
          disabled={busy}
          className="w-full rounded-full bg-ink px-5 py-4 text-sm font-black text-white disabled:opacity-50"
        >
          {busy
            ? "PLEASE WAIT…"
            : mode === "login"
              ? "SIGN IN"
              : "CREATE ACCOUNT"}
        </button>
      </form>
    </section>
  );
}
