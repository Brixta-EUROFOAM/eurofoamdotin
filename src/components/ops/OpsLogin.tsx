"use client";

import { useState, type FormEvent } from "react";

export default function OpsLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const res = await fetch("/api/ops/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: f.get("name"), pin: f.get("pin") }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (res?.ok) window.location.href = "/ops";
    else setError(data?.error || "Couldn't sign in. Try again.");
  }

  return (
    <main className="op-login">
      <form onSubmit={submit}>
        <div>
          <p style={{ margin: 0, fontWeight: 800, color: "var(--g-orange)", fontSize: ".8rem", letterSpacing: ".1em" }}>
            GADDA OPS
          </p>
          <h1>Sign in</h1>
        </div>
        <label>
          Your name
          <input name="name" required autoComplete="username" autoCapitalize="words" maxLength={40} />
        </label>
        <label>
          PIN
          <input name="pin" required type="password" inputMode="numeric" pattern="\d{4,8}" autoComplete="current-password" maxLength={8} />
        </label>
        {error ? (
          <p className="op-err" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
        ) : null}
        <button className="op-btn op-btn--go" disabled={busy}>
          {busy ? "Checking…" : "Open the board"}
        </button>
        <p style={{ margin: 0, fontSize: ".82rem", color: "var(--g-ink-2)" }}>
          No PIN? Ask the admin to add you in Admin → Operations. Admins can open <a href="/admin/login">/admin</a> and come
          straight here.
        </p>
      </form>
    </main>
  );
}
