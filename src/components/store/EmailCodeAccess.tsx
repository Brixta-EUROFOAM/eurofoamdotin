"use client";
import { useState } from "react";

type Customer={id:string;name:string;email:string;mobile:string;emailVerifiedAt?:string};
export default function EmailCodeAccess({email,name,onVerified}:{email:string;name:string;onVerified:(customer:Customer)=>void}){
 const [sent,setSent]=useState("");const [code,setCode]=useState("");const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");const [error,setError]=useState("");
 const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
 async function api(path:string,body:Record<string,string>){
  const response=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Verification failed.");return data;
 }
 async function start(){if(!valid)return;setBusy(true);setError("");setMessage("");
  try{await api("/api/customer/email/start",{email,name});setSent(email.trim().toLowerCase());setCode("");setMessage("Brevo accepted the email. Check your inbox and spam folder for the six-digit code.");}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function verify(){setBusy(true);setError("");
  try{const data=await api("/api/customer/email/verify",{email:sent,code});setMessage("Email verified. Your GADDA account is ready.");onVerified(data.customer as Customer);}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 const same=sent===email.trim().toLowerCase();
 return <div style={{display:"grid",gap:8}} aria-label="Email code verification">
  {!same?<button className="g-btn g-btn--ghost g-btn--sm" type="button" disabled={busy||!valid} onClick={start}>{busy?"Requesting code...":"Email me a sign-in code"}</button>:<>
    <label className="g-field"><span>Six-digit email code</span><input type="text" inputMode="numeric" autoComplete="one-time-code" value={code} maxLength={6} placeholder="000000" onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/></label>
    <button type="button" className="g-btn g-btn--orange g-btn--sm" disabled={busy||code.length!==6} onClick={verify}>{busy?"Checking...":"Verify email & sign in"}</button>
    <button type="button" className="g-link" disabled={busy} onClick={start}>Resend email code</button>
  </>}
  {message?<small role="status" style={{color:"var(--g-ok,#167b42)"}}>{message}</small>:null}
  {error?<small role="alert" style={{color:"var(--g-err,#ba352e)"}}>{error}</small>:null}
 </div>;
}
