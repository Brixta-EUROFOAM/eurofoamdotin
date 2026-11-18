import { NextResponse } from "next/server";
import { applyPaymentLink, confirmCheckoutPayment, listOrders } from "@/lib/orders";
import { fetchRazorpayPayment } from "@/lib/razorpay-checkout";
import { fetchPaymentLink, verifyWebhook } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  Razorpay webhook: https://YOUR-DOMAIN/api/payments/razorpay
  Dashboard → Account & Settings → Webhooks → Add new webhook, with the same
  secret as RAZORPAY_WEBHOOK_SECRET and these events ticked:
    payment_link.paid, payment_link.partially_paid,
    payment_link.expired, payment_link.cancelled

  The signature is checked over the raw body. Then the link is fetched
  from Razorpay's API, so only Razorpay's own answer changes an order.
*/
export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > 200_000) return NextResponse.json({ error: "Too large." }, { status: 413 });
  const raw = await request.text();
  if (raw.length > 200_000) return NextResponse.json({ error: "Too large." }, { status: 413 });

  if (!verifyWebhook(raw, request.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment_link?: { entity?: { id?: string } }; payment?: { entity?: { id?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad JSON." }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const paymentId = event.payload?.payment?.entity?.id;
    if (!paymentId) return NextResponse.json({ error: "Missing payment ID." }, { status: 400 });
    try {
      const payment = await fetchRazorpayPayment(paymentId);
      if (payment.status !== "captured") throw new Error("Payment not captured.");
      if (!payment.order_id) return NextResponse.json({ ok: true, ignored: true });
      const exists = (await listOrders()).some((o) => o.checkout?.orderId === payment.order_id);
      if (!exists) return NextResponse.json({ ok: true, ignored: true }); // Payment Links remain handled by payment_link.* events.
      const order = await confirmCheckoutPayment(payment.order_id, paymentId, Number(payment.amount), payment.currency);
      return NextResponse.json({ ok: true, order: order.id, status: "paid" });
    } catch (e) {
      console.error("[razorpay capture webhook]", (e as Error).message);
      return NextResponse.json({ error: "Try again." }, { status: 503 });
    }
  }

  const linkId = event.payload?.payment_link?.entity?.id;
  if (!event.event?.startsWith("payment_link.") || !linkId) return NextResponse.json({ ok: true, ignored: true });

  try {
    const link = await fetchPaymentLink(linkId);
    const order = await applyPaymentLink(link);
    return NextResponse.json({ ok: true, order: order?.id || null, status: link.status });
  } catch (e) {
    // a 5xx makes Razorpay try again later
    console.error("[razorpay webhook]", linkId, (e as Error).message);
    return NextResponse.json({ error: "Try again." }, { status: 503 });
  }
}
