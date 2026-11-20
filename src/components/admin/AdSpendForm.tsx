"use client";
import { useState, type FormEvent } from "react";
export default function AdSpendForm() {
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f=new FormData(e.currentTarget);
    setError(""); setBusy(true);
    try {
      const r=await fetch("/api/admin/ad-spend", { method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(Object.fromEntries(f.entries())) });
      const body=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(body.error||"Unable to save spend.");
      window.location.reload();
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return <form onSubmit={submit} style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"end",margin:"16px 0"}}>
    <label>Ad source <select name="source" required defaultValue="meta"><option value="meta">meta</option><option value="google">google</option><option value="other">other</option></select></label>
    <label>Campaign (match UTM campaign) <input name="campaign" required maxLength={100} placeholder="guwahati_launch" /></label>
    <label>From <input name="start" type="date" required /></label>
    <label>To <input name="end" type="date" required /></label>
    <label>Spend ₹ <input name="amount" type="number" min="0" step="0.01" required /></label>
    <button type="submit" disabled={busy}>{busy?"Saving…":"Save campaign spend"}</button>
    {error&&<p role="alert">{error}</p>}
  </form>;
}
