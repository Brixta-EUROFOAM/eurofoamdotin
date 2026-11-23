import { createHmac } from "crypto";
import { db, hasDb } from "@/lib/db";
import { OtpFailure } from "@/lib/gadda-otp";

/** Brevo owns the confirmed subscriber status; local record stores DOI-started consent only. */
export async function initiateGaddaNewsletter(emailRaw: string, source: string) {
  const email=emailRaw.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)||email.length>120)throw new OtpFailure("Enter a valid email address.",422);
  const apiKey=process.env.BREVO_API_KEY?.trim();
  const templateId=Number(process.env.BREVO_DOI_TEMPLATE_ID),listId=Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  if(!apiKey||!Number.isSafeInteger(templateId)||templateId<=0||!Number.isSafeInteger(listId)||listId<=0) {
    throw new OtpFailure("Newsletter confirmation is unavailable. Please try later.",503);
  }
  // Rate-limit by email across all app replicas, not only by IP.
  // This audit state is distinct from the confirmed marketing audience in Brevo.
  const secret = process.env.GADDA_OTP_SECRET || process.env.CUSTOMER_SESSION_SECRET;
  const auditKey = secret ? `doi:${createHmac("sha256", secret).update(email).digest("hex")}` : "";
  const now = Date.now();
  if (hasDb() && auditKey) {
    const c = await (await db()).connect();
    try {
      await c.query("BEGIN");
      await c.query("insert into gadda.meta (key,value) values ($1,'{}') on conflict (key) do nothing",[auditKey]);
      const old = await c.query("select value from gadda.meta where key=$1 for update",[auditKey]);
      let last = 0;
      try { last = Number(JSON.parse(old.rows[0].value).at || 0); } catch {}
      if (last && now-last < 5*60_000) throw new OtpFailure("We already sent a confirmation recently. Check your inbox before requesting another.",429);
      await c.query("update gadda.meta set value=$2, at=now() where key=$1",[auditKey,JSON.stringify({at:now,source,status:"pending"})]);
      await c.query("COMMIT");
    } catch (e) { await c.query("ROLLBACK").catch(()=>{}); throw e; }
    finally { c.release(); }
  }
  let res:Response;
  try {
    res=await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation",{
      method:"POST",headers:{"api-key":apiKey,"Content-Type":"application/json"},
      body:JSON.stringify({email,includeListIds:[listId],templateId,redirectionUrl:"https://gadda.store/?newsletter=confirmed"}),
      signal:AbortSignal.timeout(8000),cache:"no-store",
    });
  } catch {throw new OtpFailure("Brevo newsletter confirmation could not be sent.",503);}
  if(!res.ok){console.error("[gadda newsletter] DOI rejected",res.status);throw new OtpFailure("Newsletter confirmation is temporarily unavailable.",503);}
  // IMPORTANT: Brevo's confirmed list (not gadda.subscribers) is the source of truth.
  // A DOI request is not consent confirmation; email must not enter marketing sends yet.
  return {ok:true as const,status:"confirmation_email_requested" as const};
}
