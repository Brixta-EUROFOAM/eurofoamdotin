import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { dataDir } from "@/lib/store";
import { pruneIfDue } from "@/lib/retention";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/* "Call me back" requests → data/callbacks.jsonl (download from /api/admin/leads?type=callbacks). */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`cb:${clientIp(request)}`, 4, 60 * 60_000)) return tooMany();
  const body = await readJson<Record<string, unknown>>(request, 4096);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (clip(body.website, 50)) return NextResponse.json({ ok: true });

  const name = clip(body.name, 80);
  const phone = clip(body.phone, 20).replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  const when = clip(body.when, 40);
  const message = clip(body.message, 600);
  if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Enter your name and a 10-digit mobile number." }, { status: 422 });
  }
  await fs.mkdir(dataDir(), { recursive: true });
  void pruneIfDue("callbacks.jsonl");
  await fs.appendFile(
    path.join(dataDir(), "callbacks.jsonl"),
    JSON.stringify({ at: new Date().toISOString(), name, phone, when, message }) + "\n",
    "utf-8"
  );
  return NextResponse.json({ ok: true });
}
