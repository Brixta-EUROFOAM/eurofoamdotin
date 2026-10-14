import { NextResponse } from "next/server";
import { createOrder, OrderError, whatsappFor } from "@/lib/orders";
import { getStoreData } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Light spam guard: max 5 orders per IP per 10 minutes. */
const recent = new Map<string, number[]>();

export async function POST(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (hits.length >= 5) {
    return NextResponse.json({ error: "Too many orders in a short time. Please call us instead." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true, id: "OK" }); // honeypot
  }

  try {
    const order = await createOrder(body);
    hits.push(now);
    recent.set(ip, hits);
    const { site } = await getStoreData();
    return NextResponse.json({
      ok: true,
      id: order.id,
      total: order.total,
      whatsapp: whatsappFor(site.phone, order),
    });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 422 });
    console.error("[orders] failed", e);
    return NextResponse.json({ error: "We couldn't place the order. Please call us." }, { status: 500 });
  }
}
