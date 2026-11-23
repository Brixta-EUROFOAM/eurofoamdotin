"use client";
import { useEffect, useState,type FormEvent } from "react";
import Link from "next/link";
import EmailCodeAccess from "@/components/store/EmailCodeAccess";
import WhatsAppAccountSignIn from "@/components/store/WhatsAppAccountSignIn";

type Customer={id:string;name:string;email:string;mobile:string;emailVerifiedAt?:string};
export default function OtpAccountAccess({onSuccess}:{onSuccess:(customer:Customer)=>void}){
 const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");
 const [legacy,setLegacy]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 const [otpEnabled,setOtpEnabled]=useState(false);
 const [waSigninAvailable,setWaSigninAvailable]=useState(false);
 useEffect(()=>{let active=true;
   fetch("/api/customer/phone/status",{cache:"no-store"}).then(r=>r.json())
     .then(x=>{if(active){setOtpEnabled(x.otpEnabled===true);setWaSigninAvailable(x.whatsappAvailable===true);}})
     .catch(()=>{});
   return ()=>{active=false;};
 },[]);
 async function passwordSignIn(e:FormEvent){e.preventDefault();setBusy(true);setError("");
  try{const res=await fetch("/api/customer/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
    const data=await res.json();if(!res.ok)throw new Error(data.error||"Could not sign in.");onSuccess(data.customer);}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 return <section className="g-narrow" style={{marginInline:"auto",paddingBlock:48}}>
  <h1 className="g-h2">Your GADDA account</h1>
  <p className="g-lede">{otpEnabled ? "Sign in or create an account with a one-time email code." : "Sign in with your existing password. Guest checkout remains available; new account creation resumes when verification is enabled."}</p>
  <div className="g-card-flat" style={{padding:24,display:"grid",gap:16}}>
   {otpEnabled ? <label className="g-field"><span>Full name (first-time customers)</span><input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" maxLength={80} placeholder="Your name" /></label> : null}
   <label className="g-field"><span>Email address</span><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" maxLength={120} placeholder="you@example.com" /></label>
   {otpEnabled && !legacy?<EmailCodeAccess email={email} name={name} onVerified={onSuccess}/>:<form onSubmit={passwordSignIn} style={{display:"grid",gap:12}}>
    <label className="g-field"><span>Existing account password</span><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/></label>
    <button className="g-btn g-btn--orange" disabled={busy} type="submit">{busy?"Signing in...":"Sign in with password"}</button>
    {error?<small role="alert" className="g-error">{error}</small>:null}
   </form>}
   {otpEnabled ? <button type="button" className="g-link" onClick={()=>setLegacy(x=>!x)}>{legacy?"Use one-time email code instead":"Existing customer? Use password instead"}</button> : null}
   {otpEnabled && waSigninAvailable ? <details><summary>Already linked WhatsApp? Sign in with a WhatsApp code</summary><WhatsAppAccountSignIn onSuccess={onSuccess}/></details> : null}
   <p className="g-note">{otpEnabled ? "Only entering the code activates the account." : "Verification is temporarily paused."} Newsletters are optional and separate. <Link href="/policies/privacy">Privacy policy</Link>.</p>
  </div>
 </section>;
}
