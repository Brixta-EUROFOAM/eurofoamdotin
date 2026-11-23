"use client";
import { useState } from "react";

type Customer = { id: string; name: string; email: string; mobile: string; createdAt: string };
export default function WhatsAppAccountSignIn({ onSuccess }: { onSuccess: (c: Customer) => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const send = async () => {
    setBusy(true); setError(""); setInfo("");
    try {
      const r = await fetch("/api/customer/phone/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "WhatsApp code could not be sent.");
      setSent(true); setInfo("Check WhatsApp on your phone for the six-digit code.");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/customer/phone/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code, signIn: true }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Invalid WhatsApp code.");
      if (!d.customer) throw new Error("This number is verified, but no GADDA account is linked yet. Use email OTP first, then link WhatsApp under Your Account.");
      onSuccess(d.customer as Customer);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
    <label className="g-field"><span>WhatsApp number</span>
      <input type="tel" autoComplete="tel-national" inputMode="tel" value={phone}
        onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setSent(false); }} placeholder="10-digit number" />
    </label>
    {sent ? <>
      <label className="g-field"><span>Six-digit WhatsApp code</span><input inputMode="numeric" autoComplete="one-time-code" value={code} maxLength={6} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} /></label>
      <button type="button" className="g-btn g-btn--orange" disabled={busy || code.length !== 6} onClick={verify}>{busy ? "Verifying…" : "Verify and sign in"}</button>
      <button type="button" className="g-link" disabled={busy} onClick={send}>Resend WhatsApp code</button>
    </> : <button type="button" className="g-btn g-btn--ghost" disabled={busy || !/^[6-9]\d{9}$/.test(phone)} onClick={send}>{busy ? "Sending…" : "Send WhatsApp code"}</button>}
    {info ? <small role="status">{info}</small> : null}
    {error ? <small role="alert" className="g-error">{error}</small> : null}
  </div>;
}
