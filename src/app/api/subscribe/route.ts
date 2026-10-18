import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/leads";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONSENT_TEXT = "By signing up you agree to get marketing emails from GADDA. See our privacy notice.";

/* Newsletter opt-ins → gadda.subscribers with proof of consent. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`sub:${clientIp(request)}`, 5, 60 * 60_000)) return tooMany();
  const body = await readJson<{ email?: string; website?: string }>(request, 1024);
  if (body?.website) return NextResponse.json({ ok: true });
  const email = String(body?.email || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }
  await addSubscriber({ email, consent: CONSENT_TEXT, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
