import { NextResponse } from "next/server";
import { getOrder, saveCheckoutOrder, OrderError } from "@/lib/orders";
import { createRazorpayOrder, razorpayErrorStatus } from "@/lib/razorpay-checkout";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`checkout-create:${clientIp(request)}`, 15, 10 * 60_000)) return tooMany();
  const body = await readJson<{ id?: string; phone?: string }>(request, 2048);
  if (!body?.id || !body.phone) return NextResponse.json({ error: "Missing order ID or phone." }, { status: 400 });
  try {
    const order = await getOrder(String(body.id).slice(0, 32));
    if (!order || order.customer.phone.replace(/\D/g, "").slice(-10) !== String(body.phone).replace(/\D/g, "").slice(-10) || String(body.phone).replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (order.payment !== "online" || order.status === "cancelled") return NextResponse.json({ error: "Online payment unavailable for this order." }, { status: 400 });
    if (order.checkout?.status === "paid" || order.pay?.status === "paid") return NextResponse.json({ error: "This order is already paid." }, { status: 409 });
    const amount = Math.round(order.total * 100); // NEVER trust a client-supplied amount.
    if (!Number.isSafeInteger(amount) || amount < 100) return NextResponse.json({ error: "Minimum amount is ₹1." }, { status: 400 });
    const razorpayOrderId = order.checkout?.orderId || (await createRazorpayOrder(amount, order.id)).id;
    if (!order.checkout) await saveCheckoutOrder(order.id, razorpayOrderId, amount);
    return NextResponse.json({ order_id: razorpayOrderId, amount, currency: "INR", key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("[razorpay checkout create]", error);
    return NextResponse.json({ error: "Unable to start payment.", }, { status: razorpayErrorStatus(error) });
  }
}
