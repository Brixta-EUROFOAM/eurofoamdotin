import { otpEnabled } from "@/lib/gadda-feature-flags";
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { db, hasDb } from "@/lib/db";
import { OtpFailure } from "@/lib/gadda-otp";
import { sendWhatsAppTemplate, sendQuickSmsOtp, whatsappHash, whatsappOtpConfigured,
  quickSmsConfigured, normalizeWaPhone } from "@/lib/gadda-whatsapp";

/** Server-generated, 6-digit code: WhatsApp first, explicit Quick SMS fallback.
 * OTP is HMAC-hashed in Postgres, single-use, and bound to recipient & delivery channel. */
export const PHONE_COOKIE = "gd_phone_otp";
export type PhoneOtpChannel = "whatsapp" | "sms";
const VALID_FOR_MS = 5 * 60_000;
const VERIFIED_FOR_MS = 60 * 60_000;
const COOLDOWN_MS = 60_000;
export const phoneOtpRequired = () => otpEnabled() && process.env.GADDA_PHONE_OTP_REQUIRED === "true";
export const phoneOtpConfigured = () => whatsappOtpConfigured() || quickSmsConfigured();
export const normalizedPhone = normalizeWaPhone;
function secret() {
  const s = process.env.GADDA_OTP_SECRET || process.env.CUSTOMER_SESSION_SECRET;
  if (!s || s.length < 32) throw new OtpFailure("OTP signing secret is missing.", 503);
  return s;
}
function hmac(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
function keyOf(phone: string) { return `otp:phone:${whatsappHash(phone)}`; }
function same(a: string, b: string) {
  try { const x = Buffer.from(a, "hex"), y = Buffer.from(b, "hex");
    return x.length === 32 && y.length === 32 && timingSafeEqual(x, y); }
  catch { return false; }
}
export function phoneProof(phone: string, channel: PhoneOtpChannel) {
  const data = Buffer.from(JSON.stringify({ p: phone, c: channel, e: Date.now() + VERIFIED_FOR_MS })).toString("base64url");
  return `${data}.${hmac(`phone-proof:${data}`)}`;
}
function decodeProof(token: string | undefined, rawPhone: string): { channel: PhoneOtpChannel } | null {
  const phone = normalizedPhone(rawPhone);
  if (!phone || !token || token.length > 350) return null;
  try {
    const [data, mac] = token.split(".");
    if (!data || !mac || !same(hmac(`phone-proof:${data}`), mac)) return null;
    const d = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as { p: string; c: PhoneOtpChannel; e: number };
    return d.p === phone && (d.c === "whatsapp" || d.c === "sms") && Number.isFinite(d.e) && d.e > Date.now() ? { channel: d.c } : null;
  } catch { return null; }
}
export function phoneProofValid(token: string | undefined, rawPhone: string) { return decodeProof(token, rawPhone) !== null; }
/** WhatsApp delivery notifications require WhatsApp-channel verification, not only SMS. */
export function phoneWhatsAppProofValid(token: string | undefined, rawPhone: string) {
  return decodeProof(token, rawPhone)?.channel === "whatsapp";
}
export function phoneProofChannel(token: string | undefined, rawPhone: string): PhoneOtpChannel | null {
  return decodeProof(token, rawPhone)?.channel || null;
}

type State = { at: number; windowAt: number; sends: number; attempts: number;
  status: "sending" | "ready" | "failed"; salt: string; hash: string; channel: PhoneOtpChannel; messageId?: string };
function parse(raw: string): State | null {
  try { const x = JSON.parse(raw) as State; return x?.hash && x.salt && Number.isFinite(x.at)
    && (x.channel === "sms" || x.channel === "whatsapp") ? x : null; }
  catch { return null; }
}
export async function sendPhoneOtp(rawPhone: string, channel: PhoneOtpChannel = "whatsapp") {
  if (!hasDb()) throw new OtpFailure("Phone verification requires Postgres.", 503);
  if (channel !== "whatsapp" && channel !== "sms") throw new OtpFailure("Invalid delivery channel.", 422);
  if (channel === "whatsapp" && !whatsappOtpConfigured()) throw new OtpFailure("WhatsApp OTP isn't configured yet.", 503);
  if (channel === "sms" && !quickSmsConfigured()) throw new OtpFailure("Quick SMS fallback isn't enabled.", 503);
  const phone = normalizedPhone(rawPhone);
  if (!phone) throw new OtpFailure("Enter a valid 10-digit Indian mobile number.", 422);
  secret();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const salt = randomBytes(16).toString("hex");
  const now = Date.now(), key = keyOf(phone);
  const client = await (await db()).connect();
  let proposed: State, serialized: string;
  try {
    await client.query("BEGIN");
    await client.query("insert into gadda.meta (key,value) values ($1,'{}') on conflict (key) do nothing", [key]);
    const found = await client.query("select value from gadda.meta where key=$1 for update", [key]);
    const old = parse(found.rows[0].value);
    // Avoid duplicate billable messages when a provider response was delayed or unknown.
    if (old?.at && now - old.at < COOLDOWN_MS) throw new OtpFailure("Wait 60 seconds before requesting another code.", 429);
    const windowAt = old?.windowAt && now - old.windowAt < 3_600_000 ? old.windowAt : now;
    const sends = old?.windowAt === windowAt ? old.sends + 1 : 1;
    if (sends > 5) throw new OtpFailure("Too many code requests. Try again in an hour.", 429);
    proposed = { at: now, windowAt, sends, attempts: 0, status: "sending", channel,
      salt, hash: hmac(`phone-otp:${channel}:${phone}:${salt}:${code}`) };
    serialized = JSON.stringify(proposed);
    await client.query("update gadda.meta set value=$2,at=now() where key=$1", [key, serialized]);
    await client.query("COMMIT");
  } catch (e) { await client.query("ROLLBACK").catch(() => {}); throw e; }
  finally { client.release(); }
  try {
    const sent = channel === "whatsapp" ? await sendWhatsAppTemplate("otp", phone, [code]) : await sendQuickSmsOtp(phone, code);
    const ready = JSON.stringify({ ...proposed!, status: "ready", messageId: sent.id });
    const updated = await (await db()).query("update gadda.meta set value=$3,at=now() where key=$1 and value=$2 returning key", [key, serialized!, ready]);
    if (!updated.rowCount) throw new OtpFailure("Your code was superseded. Request a new one after 60 seconds.", 409);
  } catch (error) {
    const failed = JSON.stringify({ ...proposed!, status: "failed" });
    await (await db()).query("update gadda.meta set value=$3,at=now() where key=$1 and value=$2", [key, serialized!, failed]).catch(() => {});
    console.error("[gadda Fast2SMS OTP] Provider did not confirm acceptance", channel, (error as Error).name);
    if (error instanceof OtpFailure) throw error;
    throw new OtpFailure(`Fast2SMS did not confirm ${channel === "whatsapp" ? "WhatsApp" : "SMS"} code acceptance. Try email sign-in or check gateway logs.`, 503);
  }
  return { ok: true as const, acceptedBy: channel === "whatsapp" ? "fast2sms_whatsapp" : "fast2sms_quick_sms",
    channel, expiresInSeconds: 300 };
}

export async function verifyPhoneOtp(rawPhone: string, rawCode: string) {
  if (!hasDb()) throw new OtpFailure("Phone OTP verification is unavailable.", 503);
  const phone = normalizedPhone(rawPhone), code = rawCode.trim();
  if (!phone || !/^\d{6}$/.test(code)) throw new OtpFailure("Enter the six-digit verification code.", 422);
  const key = keyOf(phone), client = await (await db()).connect();
  let committed = false;
  try {
    await client.query("BEGIN");
    const found = await client.query("select value from gadda.meta where key=$1 for update", [key]);
    const state = found.rows[0] ? parse(found.rows[0].value) : null;
    if (!state || state.status !== "ready" || Date.now() - state.at > VALID_FOR_MS || state.attempts >= 5) {
      throw new OtpFailure("Code expired or unavailable. Request a new code.", 422);
    }
    state.attempts++;
    const correct = same(state.hash, hmac(`phone-otp:${state.channel}:${phone}:${state.salt}:${code}`));
    if (!correct) {
      await client.query("update gadda.meta set value=$2,at=now() where key=$1", [key, JSON.stringify(state)]);
      await client.query("COMMIT"); committed = true;
      throw new OtpFailure("Incorrect code. Try again.", 422);
    }
    await client.query("delete from gadda.meta where key=$1", [key]);
    await client.query("COMMIT"); committed = true;
    return { ok: true as const, phone, channel: state.channel, proof: phoneProof(phone, state.channel) };
  } catch (e) { if (!committed) await client.query("ROLLBACK").catch(() => {}); throw e; }
  finally { client.release(); }
}
