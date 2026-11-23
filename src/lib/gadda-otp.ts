import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";
import { db, hasDb } from "@/lib/db";
import type { Customer } from "@/lib/customerAuth";

/** Server-only OTP module; all email codes live as HMAC digests in Postgres. */
export class OtpFailure extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const OTP_LIFETIME_MS = 10 * 60_000;
const COOLDOWN_MS = 60_000;
const EMAIL_PER_HOUR = 5;
const normalize = (s: string) => s.trim().toLowerCase();
const emailOk = (s: string) => s.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

function secret() {
  const s = process.env.GADDA_OTP_SECRET || process.env.CUSTOMER_SESSION_SECRET;
  if (!s || s.length < 32) throw new OtpFailure("Email verification is not configured. Please contact GADDA.", 503);
  return s;
}
function storage() {
  if (!hasDb()) throw new OtpFailure("Email verification requires GADDA's Postgres database.", 503);
}
function digest(s: string) { return createHmac("sha256", secret()).update(s).digest("hex"); }
function keyFor(email: string) { return `otp:email:${digest(`email:${email}`)}`; }
function codeDigest(email: string, salt: string, code: string) { return digest(`${email}:${salt}:${code}`); }
function same(a: string, b: string) {
  try { const x = Buffer.from(a, "hex"), y = Buffer.from(b, "hex"); return x.length === 32 && y.length === 32 && timingSafeEqual(x, y); }
  catch { return false; }
}

type OtpRecord = {
  hash: string; salt: string; name: string;
  expiresAt: number; sentAt: number; windowAt: number; sends: number;
  attempts: number; status: "sending" | "ready" | "failed";
};
function parse(s: string): OtpRecord | null {
  try { const d = JSON.parse(s) as OtpRecord; return d && typeof d.hash === "string" ? d : null; }
  catch { return null; }
}

async function sendBrevoEmail(email: string, code: string) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const sender = (process.env.GADDA_EMAIL_FROM || process.env.GADDA_ALERT_FROM || "").trim();
  if (!apiKey || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) {
    throw new OtpFailure("Brevo transactional email is not configured.", 503);
  }
  let result: Response;
  try {
    result = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "GADDA Accounts", email: sender },
        to: [{ email }],
        subject: "Your GADDA sign-in code",
        textContent: `Your GADDA verification code is ${code}. It expires in 10 minutes. If you didn't request it, ignore this email. GADDA will never ask you to share this code.`,
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto"><h1>GADDA</h1><p>Use this code to verify your email and sign in:</p><p style="font-size:30px;font-weight:bold;letter-spacing:7px">${code}</p><p>Expires in 10 minutes. Never share it with anyone.</p></div>`,
        tags: ["gadda-email-otp"],
      }), cache: "no-store", signal: AbortSignal.timeout(8000),
    });
  } catch { throw new OtpFailure("Email provider could not be reached. Try again shortly.", 503); }
  if (!result.ok) {
    // Never expose raw Brevo payloads, keys or addresses to the browser.
    console.error("[gadda otp] Brevo rejected email, HTTP", result.status);
    throw new OtpFailure(result.status === 429 ? "Email limit reached. Try later." : "Email provider rejected the code. Try later.", result.status === 429 ? 429 : 503);
  }
  const info = await result.json().catch(() => ({})) as { messageId?: string };
  if (!info.messageId) throw new OtpFailure("Email provider did not confirm acceptance.", 503);
}

export async function startEmailOtp(rawEmail: string, rawName: string) {
  storage(); secret();
  const email = normalize(rawEmail);
  const name = rawName.trim().replace(/[\r\n\t]/g, " ").slice(0, 80);
  if (!emailOk(email)) throw new OtpFailure("Enter a valid email address.", 422);
  if (name && name.length < 2) throw new OtpFailure("Enter your name.", 422);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const salt = randomBytes(16).toString("hex");
  const key = keyFor(email);
  const now = Date.now();
  const pool = await db();
  const client = await pool.connect();
  let stored: string;
  try {
    await client.query("BEGIN");
    await client.query("insert into gadda.meta (key,value) values ($1,'{}') on conflict (key) do nothing", [key]);
    const result = await client.query("select value from gadda.meta where key=$1 for update", [key]);
    const old = parse(result.rows[0].value);
    if (old?.status !== "failed" && old?.sentAt && now - old.sentAt < COOLDOWN_MS) {
      throw new OtpFailure("Wait 60 seconds before requesting another email code.", 429);
    }
    const windowAt = old?.windowAt && now - old.windowAt < 3_600_000 ? old.windowAt : now;
    const sends = old?.windowAt === windowAt ? old.sends + 1 : 1;
    if (sends > EMAIL_PER_HOUR) throw new OtpFailure("Too many verification emails. Try again in one hour.", 429);
    const data: OtpRecord = {
      hash: codeDigest(email, salt, code), salt, name: name || old?.name || "GADDA customer",
      sentAt: now, expiresAt: now + OTP_LIFETIME_MS, windowAt, sends,
      attempts: 0, status: "sending",
    };
    stored = JSON.stringify(data);
    await client.query("update gadda.meta set value=$2, at=now() where key=$1", [key, stored]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK").catch(() => {}); throw error; }
  finally { client.release(); }

  try {
    await sendBrevoEmail(email, code);
    // Atomic compare-and-swap prevents an old send response from enabling a replacement OTP.
    const next = JSON.stringify({ ...(JSON.parse(stored!) as OtpRecord), status: "ready" });
    await (await db()).query("update gadda.meta set value=$3, at=now() where key=$1 and value=$2", [key, stored!, next]);
  } catch (error) {
    const next = JSON.stringify({ ...(JSON.parse(stored!) as OtpRecord), status: "failed" });
    await (await db()).query("update gadda.meta set value=$3, at=now() where key=$1 and value=$2", [key, stored!, next]).catch(() => {});
    throw error;
  }
  return { ok: true as const, acceptedBy: "brevo" as const, expiresInSeconds: 600 };
}

export async function verifyEmailOtp(rawEmail: string, rawCode: string): Promise<Customer> {
  storage(); secret();
  const email = normalize(rawEmail);
  const code = rawCode.trim();
  if (!emailOk(email) || !/^\d{6}$/.test(code)) throw new OtpFailure("Enter the six-digit code from your email.", 422);
  const key = keyFor(email);
  const client = await (await db()).connect();
  let committed = false;
  try {
    await client.query("BEGIN");
    const found = await client.query("select value from gadda.meta where key=$1 for update", [key]);
    const record = found.rows[0] ? parse(found.rows[0].value) : null;
    if (!record || record.status !== "ready" || Date.now() > record.expiresAt || record.attempts >= 5) {
      throw new OtpFailure("Code expired or unavailable. Request another code.", 422);
    }
    if (!same(codeDigest(email, record.salt, code), record.hash)) {
      record.attempts++;
      await client.query("update gadda.meta set value=$2, at=now() where key=$1", [key, JSON.stringify(record)]);
      await client.query("COMMIT"); committed = true;
      throw new OtpFailure("Incorrect code. Try again.", 422);
    }
    const row = await client.query(
      "select id,name,email,mobile,created_at,email_verified_at from gadda.customers where email=$1 for update", [email]);
    let customer: Customer;
    if (row.rows[0]) {
      const current = row.rows[0];
      await client.query("update gadda.customers set email_verified_at=coalesce(email_verified_at,now()) where id=$1", [current.id]);
      customer = { id: current.id, name: current.name, email, mobile: current.mobile,
        createdAt: new Date(current.created_at).toISOString(), emailVerifiedAt: new Date(current.email_verified_at || Date.now()).toISOString() };
    } else {
      const id = `customer-${Date.now()}-${randomBytes(6).toString("hex")}`;
      const passSalt = randomBytes(16).toString("hex");
      // A random unknown password preserves legacy account schema; this account uses email OTP.
      const passwordHash = `${passSalt}:${scryptSync(randomBytes(32), passSalt, 64).toString("hex")}`;
      const created = await client.query(
        `insert into gadda.customers (id,name,email,mobile,password_hash,created_at,email_verified_at)
         values ($1,$2,$3,'',$4,now(),now()) returning created_at,email_verified_at`,
        [id, record.name, email, passwordHash]);
      customer = { id, name: record.name, email, mobile: "", createdAt: new Date(created.rows[0].created_at).toISOString(),
        emailVerifiedAt: new Date(created.rows[0].email_verified_at).toISOString() };
    }
    await client.query("delete from gadda.meta where key=$1", [key]);
    await client.query("COMMIT"); committed = true;
    return customer;
  } catch (error) {
    if (!committed) await client.query("ROLLBACK").catch(() => {});
    // Unique-email races result in safe retry, never a duplicate account.
    if ((error as { code?: string }).code === "23505") throw new OtpFailure("Please request a fresh code and try again.", 409);
    throw error;
  } finally { client.release(); }
}
