import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/leads";
import { notifyAdmin } from "@/lib/admin-notify";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONSENT_TEXT = "By signing up you agree to get marketing emails from GADDA. See our privacy notice.";

/* Newsletter opt-ins → gadda.subscribers with proof of consent. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`sub:${clientIp(request)}`, 5, 60 * 60_000)) return tooMany();
  const body = await readJson<{ email?: string; website?: string; source?: string; optIn?: boolean }>(request, 1024);
  if (body?.website) return NextResponse.json({ ok: true });
  if (body?.source === "sleep_quiz" && body.optIn !== true) {
    return NextResponse.json({ error: "Email subscription requires explicit consent." }, { status: 422 });
  }
  const email = String(body?.email || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }
  const at = new Date().toISOString();
  const source = body?.source === "sleep_quiz" ? "sleep_quiz" : "newsletter";
  await addSubscriber({ email, consent: CONSENT_TEXT, at, source });
  await notifyAdmin({ key: `signup-${email}-${at}`, title: "New newsletter subscriber", lines: [
    `Email: ${email}`, `Source: ${source}`, `Consent: ${CONSENT_TEXT}`, "Manage: /admin/crm",
  ] });
  return NextResponse.json({ ok: true });
}
