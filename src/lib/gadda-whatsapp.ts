import { createHmac, timingSafeEqual } from "crypto";
import { db, hasDb } from "@/lib/db";

/** Fast2SMS acts as the delivery gateway for the WhatsApp Business Platform.
 * This file does not call graph.facebook.com or require a Meta access token. */
export type WaMessageKind = "otp" | "received" | "status" | "paid";
export type WaSendResult = { id: string };

const enabled = () => process.env.GADDA_WHATSAPP_ENABLED === "true";
const apiKey = () => process.env.FAST2SMS_API_KEY?.trim() || "";
const senderId = () => process.env.FAST2SMS_WA_PHONE_NUMBER_ID?.trim() || "";
const locale = () => process.env.FAST2SMS_WA_TEMPLATE_LANGUAGE?.trim() || "en_US";
const authTemplate = () => process.env.FAST2SMS_WA_AUTH_TEMPLATE?.trim() || "";
const apiVersion = () => process.env.FAST2SMS_WA_API_VERSION?.trim() || "v26.0";

export function whatsappOtpConfigured() {
  return enabled() && !!apiKey() && /^\d{5,30}$/.test(senderId()) && /^[a-z0-9_]{1,512}$/.test(authTemplate())
    && /^v\d+\.0$/.test(apiVersion());
}
export function whatsappConfigured() {
  return enabled() && !!apiKey() && /^\d{5,30}$/.test(senderId()) &&
    [process.env.FAST2SMS_WA_MESSAGE_ID_RECEIVED, process.env.FAST2SMS_WA_MESSAGE_ID_STATUS,
     process.env.FAST2SMS_WA_MESSAGE_ID_PAID].every(v => /^\d+$/.test(v?.trim() || ""));
}
export function quickSmsConfigured() {
  return process.env.FAST2SMS_QUICK_SMS_FALLBACK_ENABLED === "true" && !!apiKey();
}
export function normalizeWaPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const national = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(national) ? national : "";
}

function checkedId(id: string | undefined, context: string) {
  if (!/^\d+$/.test(id?.trim() || "")) throw new Error(`Missing approved Fast2SMS ${context} ID`);
  return id!.trim();
}
function acceptedReply(httpStatus: number, ok: boolean, data: Record<string, unknown>) {
  const identifier = data.request_id || data.message_id ||
    (Array.isArray(data.messages) ? (data.messages[0] as { id?: unknown })?.id : undefined) ||
    (data.data && typeof data.data === "object" ? (data.data as { request_id?: unknown; id?: unknown }).request_id ||
      (data.data as { id?: unknown }).id : undefined);
  const acknowledged = data.return === true || data.success === true || typeof identifier === "string" ||
    (typeof data.status_code === "number" && data.status_code === 200);
  const rejected = data.return === false || data.success === false || !!data.error;
  return ok && httpStatus >= 200 && httpStatus < 300 && acknowledged && !rejected
    ? { id: String(identifier || `accepted:${Date.now()}`) } : null;
}
async function jsonRequest(url: string, options: RequestInit) {
  let response: Response;
  try { response = await fetch(url, { ...options, cache: "no-store", signal: AbortSignal.timeout(10000) }); }
  catch { throw new Error("Fast2SMS request outcome unknown; inspect Fast2SMS logs before resending."); }
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  const accepted = acceptedReply(response.status, response.ok, data);
  if (!accepted) {
    console.error("[gadda Fast2SMS] rejected API request", response.status, data.status_code);
    throw new Error("Fast2SMS did not accept this message. Check wallet, template approval and API key.");
  }
  return accepted;
}

/** Authentication template uses Fast2SMS's official Meta-format proxy, not a Meta token.
 * The approved Copy Code template must match BODY + button parameters. */
export async function sendWhatsAppTemplate(kind: WaMessageKind, rawPhone: string, fields: string[]): Promise<WaSendResult> {
  const phone = normalizeWaPhone(rawPhone);
  if (!phone || !apiKey()) throw new Error("Phone or Fast2SMS key is invalid");
  if (kind === "otp") {
    if (!whatsappOtpConfigured() || fields.length !== 1 || !/^\d{6}$/.test(fields[0])) {
      throw new Error("WhatsApp authentication template or six-digit code is not configured");
    }
    return jsonRequest(`https://www.fast2sms.com/dev/whatsapp/${apiVersion()}/${senderId()}/messages`, {
      method: "POST", headers: { Authorization: apiKey(), "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: `91${phone}`,
        type: "template", template: { name: authTemplate(), language: { code: locale() }, components: [
          { type: "body", parameters: [{ type: "text", text: fields[0] }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: fields[0] }] }
        ] } })
    });
  }
  if (!whatsappConfigured() || fields.length !== 3) throw new Error("WhatsApp Utility template is not configured");
  if (fields.some(v => !v.trim() || v.length > 150)) throw new Error("Invalid template variable");
  const envIds: Record<Exclude<WaMessageKind, "otp">, string | undefined> = {
    received: process.env.FAST2SMS_WA_MESSAGE_ID_RECEIVED,
    status: process.env.FAST2SMS_WA_MESSAGE_ID_STATUS,
    paid: process.env.FAST2SMS_WA_MESSAGE_ID_PAID,
  };
  const params = new URLSearchParams({
    message_id: checkedId(envIds[kind], kind), phone_number_id: senderId(), numbers: phone,
    variables_values: fields.map(v => v.replace(/[|\r\n]/g, " ").trim()).join("|"),
  });
  return jsonRequest(`https://www.fast2sms.com/dev/whatsapp?${params}`, {
    method: "GET", headers: { Authorization: apiKey(), Accept: "application/json" },
  });
}

/** Quick SMS is deliberately a user-selected fallback, not an automatic duplicate send.
 * This route may be moderated/delayed and requires Fast2SMS wallet balance. */
export async function sendQuickSmsOtp(rawPhone: string, code: string): Promise<WaSendResult> {
  const phone = normalizeWaPhone(rawPhone);
  if (!quickSmsConfigured() || !phone || !/^\d{6}$/.test(code)) throw new Error("Quick SMS fallback is not configured");
  return jsonRequest("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST", headers: { Authorization: apiKey(), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ route: "q", numbers: phone,
      message: `GADDA verification code: ${code}. Expires in 5 minutes. Do not share it.` }),
  });
}

function secret() {
  const s = process.env.GADDA_OTP_SECRET || process.env.CUSTOMER_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("GADDA_OTP_SECRET must be configured (32+ characters)");
  return s;
}
export function whatsappHash(text: string) { return createHmac("sha256", secret()).update(text).digest("hex"); }
function safeCompare(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
/** Fast2SMS Standard/custom webhook: configure our secret as `?token=...` on the callback URL.
 * The provider's Standard format is not signed with Meta's X-Hub-Signature. */
export function webhookAuthorized(token: string | null) {
  const expected = process.env.FAST2SMS_WEBHOOK_SECRET?.trim();
  return Boolean(expected && expected.length >= 32 && token && safeCompare(token, expected));
}
export async function whatsappStopped(rawPhone: string): Promise<boolean> {
  const phone = normalizeWaPhone(rawPhone);
  if (!phone || !hasDb()) return true;
  const key = `wa:stop:${whatsappHash(phone)}`;
  const { rows } = await (await db()).query("select 1 from gadda.meta where key=$1", [key]);
  return rows.length > 0;
}
export async function stopWhatsApp(rawPhone: string) {
  const phone = normalizeWaPhone(rawPhone);
  if (!phone || !hasDb()) return;
  const key = `wa:stop:${whatsappHash(phone)}`;
  await (await db()).query("insert into gadda.meta (key,value,at) values ($1,'1',now()) on conflict (key) do update set value='1',at=now()", [key]);
}
/** Status = Fast2SMS event, not proof the customer read the message until read/delivered webhook. */
export async function recordWhatsAppStatus(messageId: string, state: string, errorCode?: number) {
  if (!hasDb() || !/^[A-Za-z0-9._:-]{4,300}$/.test(messageId)) return;
  if (!["accepted", "sent", "delivered", "read", "failed", "rejected"].includes(state)) return;
  const key = `wa:delivery:${whatsappHash(messageId)}`;
  const value = JSON.stringify({ state, errorCode: Number.isSafeInteger(errorCode) ? errorCode : null,
    updatedAt: new Date().toISOString() });
  await (await db()).query("insert into gadda.meta (key,value,at) values ($1,$2,now()) on conflict (key) do update set value=$2,at=now()", [key, value]);
}
