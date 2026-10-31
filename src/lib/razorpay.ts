import { createHmac, timingSafeEqual } from "crypto";

/*
  Razorpay Payment Links (server only).

  The customer pays on Razorpay's own page (rzp.io/…), so no payment script
  runs on our site and no card or UPI details ever touch our server.

  Env (in .env next to docker-compose.yml):
    RAZORPAY_KEY_ID          rzp_test_… while testing, rzp_live_… after KYC
    RAZORPAY_KEY_SECRET      from Dashboard → Account & Settings → API Keys
    RAZORPAY_WEBHOOK_SECRET  the secret you type when adding the webhook
                             (Dashboard → Account & Settings → Webhooks)
  Without the first two, online payment is simply not offered.

  Two signatures, two secrets (Razorpay's own Node library does the same):
    after payment, the redirect back to us  → HMAC-SHA256 of
      "plink_id|reference_id|status|payment_id" with RAZORPAY_KEY_SECRET
    webhooks → HMAC-SHA256 of the raw request body with RAZORPAY_WEBHOOK_SECRET
  Either way we then fetch the link from Razorpay's API and trust only that.
*/

const API = "https://api.razorpay.com/v1";

export type RazorpayLink = {
  id: string;
  short_url: string;
  status: "created" | "partially_paid" | "paid" | "expired" | "cancelled" | string;
  amount: number; // paise
  amount_paid: number; // paise
  currency: string;
  reference_id: string;
  notes?: Record<string, string> | [];
  payments?: { payment_id: string; amount: number; method?: string; status?: string; created_at?: number }[] | null;
};

export class PaymentError extends Error {}

const keyId = () => process.env.RAZORPAY_KEY_ID?.trim() || "";
const keySecret = () => process.env.RAZORPAY_KEY_SECRET?.trim() || "";

export function razorpayReady() {
  return Boolean(keyId() && keySecret());
}

export function razorpayTestMode() {
  return keyId().startsWith("rzp_test_");
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  if (!razorpayReady()) throw new PaymentError("Online payment isn't set up.");
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId()}:${keySecret()}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new PaymentError("Couldn't reach Razorpay. Try again in a minute.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: { description?: string } } & T;
  if (!res.ok) {
    console.error("[razorpay]", method, path, res.status, data?.error?.description);
    throw new PaymentError(data?.error?.description || `Razorpay said no (${res.status}).`);
  }
  return data;
}

export async function createPaymentLink(input: {
  amountRupees: number;
  referenceId: string; // unique per link, max 40 characters
  orderId: string;
  description: string;
  customer: { name: string; phone: string; email?: string };
  notify: boolean; // true: Razorpay sends the link by SMS (and email, if we have one)
  callbackUrl: string;
  expireDays?: number;
}): Promise<RazorpayLink> {
  const digits = input.customer.phone.replace(/\D/g, "").slice(-10);
  const amount = Math.round(input.amountRupees * 100);
  if (!Number.isInteger(amount) || amount < 100) throw new PaymentError("Amount is too small for an online payment.");
  return call<RazorpayLink>("POST", "/payment_links", {
    amount,
    currency: "INR",
    accept_partial: false,
    reference_id: input.referenceId.slice(0, 40),
    description: input.description.slice(0, 2048),
    customer: {
      name: input.customer.name.slice(0, 80),
      contact: `+91${digits}`,
      ...(input.customer.email ? { email: input.customer.email } : {}),
    },
    notify: { sms: input.notify, email: input.notify && Boolean(input.customer.email) },
    reminder_enable: input.notify,
    notes: { order_id: input.orderId },
    callback_url: input.callbackUrl,
    callback_method: "get",
    expire_by: Math.floor(Date.now() / 1000) + Math.round((input.expireDays ?? 7) * 86_400),
  });
}

export async function fetchPaymentLink(id: string) {
  if (!/^plink_[A-Za-z0-9]+$/.test(id)) throw new PaymentError("Not a payment link.");
  return call<RazorpayLink>("GET", `/payment_links/${id}`);
}

const hmac = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest("hex");

function sameHex(a: string, b: string) {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

/* The redirect back from Razorpay after paying (query params on callback_url). */
export function verifyReturn(q: { linkId: string; referenceId: string; status: string; paymentId: string; signature: string }) {
  if (!keySecret() || !q.linkId || !q.paymentId || !q.signature) return false;
  return sameHex(hmac(keySecret(), `${q.linkId}|${q.referenceId}|${q.status}|${q.paymentId}`), q.signature);
}

/* A webhook from Razorpay: signature over the exact raw body. */
export function verifyWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;
  return sameHex(hmac(secret, rawBody), signature);
}
