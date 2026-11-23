import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTurnstile } from "@/lib/turnstile";
import { createOrder, OrderError, whatsappFor } from "@/lib/orders";
import { getStoreData } from "@/lib/store";
import { CUSTOMER_COOKIE, customerFromSession } from "@/lib/customerAuth";
import { PHONE_COOKIE, phoneOtpRequired, phoneProofValid, phoneWhatsAppProofValid } from "@/lib/gadda-otp-phone";
import { initiateGaddaNewsletter } from "@/lib/gadda-newsletter-doi";
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

  const challenge = await verifyTurnstile(body.turnstileToken, "order");
  if (!challenge.ok) return NextResponse.json({ error: challenge.error }, { status: challenge.status });

  try {
    const jar = await cookies();
    const customer = await customerFromSession(jar.get(CUSTOMER_COOKIE)?.value);
    const phoneVerified = phoneProofValid(jar.get(PHONE_COOKIE)?.value, String(body.phone || ""));
    if (phoneOtpRequired() && !phoneVerified) {
      return NextResponse.json({ error: "Verify your mobile number with a WhatsApp code before ordering." }, { status: 422 });
    }
    const whatsappVerified = phoneWhatsAppProofValid(jar.get(PHONE_COOKIE)?.value, String(body.phone || ""));
    const order = await createOrder(body, { customerId: customer?.id, phoneVerified, whatsappVerified });
    if (body.newsletterOptIn === true && typeof body.email === "string" && body.email.trim()) {
      // Marketing confirmation cannot delay or invalidate a successful order.
      try { await initiateGaddaNewsletter(body.email, "checkout"); }
      catch (error) { console.error("[gadda newsletter] Checkout DOI not accepted", (error as Error).name); }
    }
    const { site } = await getStoreData();

    // Standard Checkout is started by /api/create-order after the merchant order is saved.

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
