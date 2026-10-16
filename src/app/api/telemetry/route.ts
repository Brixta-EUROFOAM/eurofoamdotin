import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appendTelemetry } from "@/lib/telemetry";
import { CUSTOMER_COOKIE, customerFromSession } from "@/lib/customerAuth";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { clientIp, rateLimit, readJson, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set([
  "page_view",
  "product_view",
  "scroll_depth",
  "page_engagement",
  "add_to_cart",
  "remove_from_cart",
  "cart_quantity",
  "cart_open",
  "checkout_start",
  "checkout_step",
  "order_created",
  "pincode_check",
  "quiz_complete",
  "search",
  "wishlist_add",
]);

/* Always answer 204 so the endpoint can't be used to probe anything. */
const done = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return done();
  if (request.headers.get("sec-gpc") === "1" || request.headers.get("dnt") === "1") return done();
  if (!rateLimit(`tel:${clientIp(request)}`, 120, 60_000)) return done();

  const jar = await cookies();
  // Server-side check too: no recorded analytics consent → drop it.
  if (!parseConsent(jar.get(CONSENT_COOKIE)?.value)?.analytics) return done();

  const body = await readJson<Record<string, unknown>>(request, 4096);
  if (!body || !allowed.has(String(body.type || ""))) return done();

  try {
    const customer = await customerFromSession(jar.get(CUSTOMER_COOKIE)?.value);
    await appendTelemetry({ ...body, customerId: customer?.id });
  } catch {}
  return done();
}
