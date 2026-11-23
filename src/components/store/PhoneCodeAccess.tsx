"use client";
import { useEffect, useState } from "react";

type Channel = "whatsapp" | "sms";
export default function PhoneCodeAccess({ phone, required = false, onVerified }: {
  phone: string; required?: boolean; onVerified: (phone: string, channel: Channel) => void;
}) {
  const clean = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  const valid = /^[6-9]\d{9}$/.test(clean);
  const [whatsappAvailable, setWhatsappAvailable] = useState(false);
  const [smsAvailable, setSmsAvailable] = useState(false);
  const [sent, setSent] = useState("");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    setSent(""); setVerified(""); setCode(""); setError(""); setMessage("");
    if (!valid) { setWhatsappAvailable(false); setSmsAvailable(false); return; }
    let live = true;
    fetch(`/api/customer/phone/status?phone=${encodeURIComponent(clean)}`, { cache: "no-store" })
      .then(r => r.json()).then(x => {
        if (!live) return;
        setWhatsappAvailable(x.whatsappAvailable === true);
        setSmsAvailable(x.smsAvailable === true);
        if (x.verified === true && (x.verifiedChannel === "sms" || x.verifiedChannel === "whatsapp")) {
          setVerified(clean); setChannel(x.verifiedChannel); onVerified(clean, x.verifiedChannel);
        }
      }).catch(() => {});
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clean, valid]);
  async function api(path: string, body: Record<string, string>) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Phone code verification failed.");
    return data;
  }
  async function start(nextChannel: Channel) {
    if (!valid || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await api("/api/customer/phone/start", { phone: clean, channel: nextChannel });
      setSent(clean); setChannel(nextChannel); setCode("");
      setMessage(nextChannel === "whatsapp"
        ? "Fast2SMS accepted the WhatsApp OTP request. Open WhatsApp to read the six-digit code."
        : "Fast2SMS accepted the Quick SMS request. SMS delivery may take longer because of moderation.");
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function confirm() {
    setBusy(true); setError("");
    try {
      const result = await api("/api/customer/phone/verify", { phone: clean, code });
      const actual: Channel = result.channel === "sms" ? "sms" : "whatsapp";
      setVerified(clean); setChannel(actual); setMessage(actual === "whatsapp" ? "WhatsApp number verified." : "Phone number verified by SMS.");
      onVerified(clean, actual);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  if (!whatsappAvailable && !smsAvailable && !required) return null;
  return <div style={{ display: "grid", gap: 8, marginTop: 8 }} aria-label="Phone verification">
    {verified === clean ? <small role="status" style={{ color: "var(--g-ok,#167b42)", fontWeight: 700 }}>
      {channel === "whatsapp" ? "WhatsApp number verified" : "Mobile number verified by SMS"}</small> :
      !whatsappAvailable && !smsAvailable ? <small>{required
        ? "Phone verification is required but Fast2SMS isn't configured. Contact GADDA support."
        : "Phone verification is unavailable until Fast2SMS is configured. Checkout remains available."}</small> : <>
        {sent !== clean ? <>
          {whatsappAvailable ? <button type="button" className="g-btn g-btn--ghost g-btn--sm" disabled={busy || !valid} onClick={() => start("whatsapp")}>
            {busy ? "Sending…" : "Send code on WhatsApp"}</button> : null}
          {smsAvailable ? <button type="button" className="g-link" disabled={busy || !valid} onClick={() => start("sms")}>
            Use Quick SMS instead (may be delayed)</button> : null}
        </> : <>
          <label className="g-field"><span>Six-digit code from {channel === "whatsapp" ? "WhatsApp" : "SMS"}</span>
            <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6 digits" /></label>
          <button type="button" className="g-btn g-btn--ghost g-btn--sm" disabled={busy || code.length !== 6} onClick={confirm}>
            {busy ? "Verifying…" : "Verify code"}</button>
          <button type="button" className="g-link" disabled={busy} onClick={() => start(channel)}>
            Resend {channel === "whatsapp" ? "WhatsApp" : "SMS"} code (60s cooldown)</button>
          {smsAvailable && channel === "whatsapp" ? <button type="button" className="g-link" disabled={busy} onClick={() => start("sms")}>
            Didn't receive it? Try Quick SMS after 60 seconds</button> : null}
        </>}
      </>}
    {message ? <small role="status">{message}</small> : null}
    {error ? <small role="alert" style={{ color: "var(--g-err,#b33)" }}>{error}</small> : null}
  </div>;
}
