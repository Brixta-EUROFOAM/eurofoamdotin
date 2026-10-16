import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { dataDir } from "@/lib/store";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONSENT_TEXT = "By signing up you agree to get marketing emails from GADDA. See our privacy notice.";

/* Newsletter opt-ins → data/subscribers.jsonl with proof of consent. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`sub:${clientIp(request)}`, 5, 60 * 60_000)) return tooMany();
  const body = await readJson<{ email?: string; website?: string }>(request, 1024);
  if (body?.website) return NextResponse.json({ ok: true });
  const email = String(body?.email || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.appendFile(
    path.join(dataDir(), "subscribers.jsonl"),
    JSON.stringify({ email, consent: CONSENT_TEXT, at: new Date().toISOString() }) + "\n",
    "utf-8"
  );
  return NextResponse.json({ ok: true });
}
