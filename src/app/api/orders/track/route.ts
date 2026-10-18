import { NextResponse } from "next/server";
import { findOrderForTracking } from "@/lib/orders";
import { CANCELLED, customerTimeline, eta, getOps } from "@/lib/ops";
import { clientIp, rateLimit, readJson, sameOrigin, forbidden, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  Order tracking: order id + the phone number used. Tight rate limit so
  ids can't be enumerated, and only non-sensitive fields come back
  (no address, no email).
*/
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`track:${clientIp(request)}`, 8, 10 * 60_000)) return tooMany();
  const body = await readJson<{ id?: string; phone?: string }>(request, 1024);
  const order = await findOrderForTracking(String(body?.id || ""), String(body?.phone || ""));
  if (!order) {
    return NextResponse.json(
      { error: "We couldn't find an order with that number and phone. Check both and try again." },
      { status: 404 }
    );
  }
  const { stages } = await getOps();
  const cancelled = order.status === CANCELLED;
  return NextResponse.json({
    id: order.id,
    status: order.status,
    cancelled,
    timeline: cancelled ? [] : customerTimeline(order, stages),
    eta: cancelled ? null : eta(order, stages),
    createdAt: order.createdAt,
    city: order.customer.city,
    pincode: order.customer.pincode,
    payment: order.payment,
    total: order.total,
    lines: order.lines.map((l) => ({ name: l.name, size: l.size, height: l.height, quantity: l.quantity })),
  });
}
