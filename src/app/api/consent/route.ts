import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { dataDir } from "@/lib/store";
import { CONSENT_VERSION } from "@/lib/consent";
import { clientIp, rateLimit, readJson, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  Consent receipts (DPDP Rules: the Data Fiduciary must be able to show
  consent was given). One line per choice in data/consent.jsonl.
  Stores the random receipt id, the choice, version and time — no IP,
  no identifiers that tie it to a person.
*/
export async function POST(request: Request) {
  if (!rateLimit(`consent:${clientIp(request)}`, 20, 60_000)) return tooMany();
  const body = await readJson<Record<string, unknown>>(request, 2048);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const record = {
    id: String(body.id || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64),
    v: Number(body.v) === CONSENT_VERSION ? CONSENT_VERSION : 0,
    analytics: body.analytics === true,
    marketing: body.marketing === true,
    source: body.source === "gpc" ? "gpc" : "banner",
    at: new Date().toISOString(),
  };
  if (!record.id || !record.v) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    await fs.mkdir(dataDir(), { recursive: true });
    await fs.appendFile(path.join(dataDir(), "consent.jsonl"), JSON.stringify(record) + "\n", "utf-8");
  } catch (e) {
    console.error("[consent] write failed", e);
  }
  return NextResponse.json({ ok: true });
}
