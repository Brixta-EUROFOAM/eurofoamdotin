"use client";
import { useEffect, useState } from "react";
type Info = { configured: boolean; counts: Record<string, number>; recent: { subject: string; status: string; at: string; detail?: string }[] };
export default function NotificationStatusPanel() {
  const [info,setInfo]=useState<Info|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function load() {
    const response = await fetch("/api/admin/notifications", { cache: "no-store" });
    if (response.ok) setInfo(await response.json());
  }
  useEffect(() => { void load(); }, []);
  async function retry() {
    setBusy(true);
    try {
      const response=await fetch("/api/admin/notifications", { method: "POST" });
      if(!response.ok) throw new Error("Retry request failed");
      const outcome=await response.json();
      setMessage(`Retried ${outcome.attempted} definitively failed alerts; ${outcome.accepted} accepted by Brevo.`);
      await load();
    } catch { setMessage("Retry failed. Check server logs."); }
    finally { setBusy(false); }
  }
  return <section style={{margin:"28px 0",padding:20,border:"1px solid #ddd",borderRadius:10}}>
    <h2>Brevo admin email alerts</h2>
    {!info ? <p>Loading alert status…</p> : <>
      <p>{info.configured ? "API key and sender configured" : "Not configured — add BREVO_API_KEY and GADDA_ALERT_FROM on the server."}</p>
      <p>Accepted by Brevo: {info.counts.accepted||0} · Rejected: {info.counts.failed||0} · Uncertain: {info.counts.uncertain||0} · Pending: {info.counts.pending||0}</p>
      <button type="button" onClick={retry} disabled={busy||!info.configured||!info.counts.failed} style={{padding:"9px 15px",cursor:"pointer"}}>{busy ? "Retrying…" : "Retry rejected alerts"}</button>
      {message && <p role="status">{message}</p>}
      {info.counts.uncertain>0 && <p role="alert">Uncertain delivery outcomes require checking Brevo logs before another send to avoid duplicates.</p>}
      <ul>{info.recent.map((e,i)=><li key={i}>{e.status.toUpperCase()}: {e.subject}{e.detail ? ` — ${e.detail}` : ""}</li>)}</ul>
      <small>API acceptance is not confirmation of final inbox delivery. Check Brevo Transactional Logs.</small>
    </>}
  </section>;
}
