import Razorpay from "razorpay";

// Server only: never import this module into a client component.
function client() {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!key_id || !key_secret) throw new Error("Razorpay keys are not configured.");
  return new Razorpay({ key_id, key_secret });
}

export async function createRazorpayOrder(amount: number, receipt: string) {
  if (!Number.isSafeInteger(amount) || amount < 100) throw new Error("Amount must be at least 100 paise.");
  return client().orders.create({ amount, currency: "INR", receipt: receipt.slice(0, 40) });
}

export async function fetchRazorpayPayment(id: string) {
  if (!/^pay_[a-zA-Z0-9]+$/.test(id)) throw new Error("Invalid payment ID.");
  return client().payments.fetch(id);
}

export function razorpayErrorStatus(error: unknown): number {
  const e = error as { statusCode?: number; status?: number } | null;
  return e?.statusCode === 401 || e?.status === 401 ? 401 : 500;
}
