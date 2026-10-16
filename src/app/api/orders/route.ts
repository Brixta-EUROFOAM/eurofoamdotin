import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrder, OrderError, whatsappFor } from "@/lib/orders";
import { getStoreData } from "@/lib/store";
import { CUSTOMER_COOKIE, customerFromSession } from "@/lib/customerAuth";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`order:${clientIp(request)}`, 5, 10 * 60_000)) {
    return tooMany("Too many orders in a short time. Please call us instead.");
  }

  const body = await readJson<Record<string, unknown>>(request, 32_768);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true, id: "OK" }); // honeypot
  }

  try {
    const jar = await cookies();
    const customer = await customerFromSession(jar.get(CUSTOMER_COOKIE)?.value);
    const order = await createOrder(body, { customerId: customer?.id });
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
