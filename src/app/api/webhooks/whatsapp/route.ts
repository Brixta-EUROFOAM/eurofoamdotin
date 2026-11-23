import { NextRequest, NextResponse } from "next/server";
import { recordWhatsAppStatus, stopWhatsApp, webhookAuthorized } from "@/lib/gadda-whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fast2SMS -> Webhooks -> WhatsApp -> Standard JSON -> POST.
 * Configure URL https://gadda.store/api/webhooks/whatsapp?token=RANDOM_SECRET
 * and a JSON body containing request_id, status, mobile, webhook_type, message_text.
 * Rejects unsigned/unauthenticated public requests; does NOT accept Meta webhooks. */
export async function POST(request: NextRequest) {
  if (!webhookAuthorized(request.nextUrl.searchParams.get("token"))) return new Response("Unauthorized", { status: 401 });
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return new Response("JSON required", { status: 415 });
  }
  const raw = await request.text();
  if (raw.length > 32_000) return new Response("Request too large", { status: 413 });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw) as Record<string, unknown>; } catch { return new Response("Invalid JSON", { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return new Response("Invalid payload", { status: 400 });
  const id = String(body.request_id || body.message_id || "").slice(0, 300);
  const status = String(body.status || "").toLowerCase().slice(0, 30);
  const event = String(body.webhook_type || body.event || "").toLowerCase();
  const mobile = String(body.mobile || body.from || "");
  const incoming = String(body.message_text || body.text || "").trim();
  try {
    if (id && status) await recordWhatsAppStatus(id, status);
    if ((event === "incoming_message" || event === "incoming") &&
        /^\s*(stop|unsubscribe|opt\s*out)\s*[!.]?\s*$/i.test(incoming)) {
      await stopWhatsApp(mobile);
    }
  } catch (e) {
    console.error("[gadda fast2sms webhook] Unable to persist event", (e as Error).name);
    return NextResponse.json({ error: "Temporary failure" }, { status: 503 });
  }
  return NextResponse.json({ received: true });
}
