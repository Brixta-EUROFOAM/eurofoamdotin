import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db, hasDb } from "@/lib/db";
import { whatsappOtpConfigured, whatsappConfigured, quickSmsConfigured } from "@/lib/gadda-whatsapp";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const readiness = {
    provider: "fast2sms", whatsappOtpConfigured: whatsappOtpConfigured(),
    whatsappUtilityConfigured: whatsappConfigured(), quickSmsFallbackConfigured: quickSmsConfigured(),
    webhookSecretConfigured: Boolean(process.env.FAST2SMS_WEBHOOK_SECRET?.trim()),
    phoneOtpRequired: process.env.GADDA_PHONE_OTP_REQUIRED === "true",
  };
  if (!hasDb()) return NextResponse.json({ ...readiness, error: "Postgres required for notifications" });
  const { rows } = await (await db()).query("select key,value,at from gadda.meta where key like 'wa:outbox:%' or key like 'wa:delivery:%' order by at desc limit 100");
  const recent = rows.slice(0, 20).map((row: { key: string; value: string; at: Date }) => {
    let parsed: { state?: string; event?: string } = {};
    try { parsed = JSON.parse(row.value); } catch {}
    return { type: row.key.startsWith("wa:outbox:") ? "outbox" : "delivery", state: parsed.state || "unknown", event: parsed.event || null, at: row.at };
  });
  return NextResponse.json({ ...readiness, recent }, { headers: { "Cache-Control": "no-store" } });
}
