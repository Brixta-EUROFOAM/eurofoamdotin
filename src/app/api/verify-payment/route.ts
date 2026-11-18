import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { confirmCheckoutPayment, OrderError } from "@/lib/orders";
import { fetchRazorpayPayment, razorpayErrorStatus } from "@/lib/razorpay-checkout";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`checkout-verify:${clientIp(request)}`, 25, 10 * 60_000)) return tooMany();
  const p = await readJson<{ razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }>(request, 2048);
  if (!p?.razorpay_order_id || !p.razorpay_payment_id || !p.razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }
  if (!/^order_[A-Za-z0-9]+$/.test(p.razorpay_order_id) || !/^pay_[A-Za-z0-9]+$/.test(p.razorpay_payment_id) || !/^[a-f0-9]{64}$/i.test(p.razorpay_signature)) {
    return NextResponse.json({ error: "Invalid payment details." }, { status: 400 });
  }
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) return NextResponse.json({ error: "Payment service unavailable." }, { status: 503 });
  const signature = createHmac("sha256", secret).update(`${p.razorpay_order_id}|${p.razorpay_payment_id}`).digest();
  const supplied = Buffer.from(p.razorpay_signature, "hex");
  if (supplied.length !== signature.length || !timingSafeEqual(supplied, signature)) {
    return NextResponse.json({ error: "Payment signature mismatch." }, { status: 400 });
  }
  try {
    const payment = await fetchRazorpayPayment(p.razorpay_payment_id);
    if (payment.order_id !== p.razorpay_order_id || payment.status !== "captured") {
      return NextResponse.json({ error: "Payment has not been captured yet." }, { status: 409 });
    }
    const order = await confirmCheckoutPayment(p.razorpay_order_id, p.razorpay_payment_id, Number(payment.amount), payment.currency);
    return NextResponse.json({ success: true, id: order.id, status: "paid" });
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[razorpay checkout verify]", error);
    return NextResponse.json({ error: "Could not confirm payment yet. Please contact support with your order ID." }, { status: razorpayErrorStatus(error) });
  }
}
