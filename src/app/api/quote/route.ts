import { NextResponse } from "next/server";
import { priceLines } from "@/lib/orders";
import { clientIp, rateLimit, readJson, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Live prices for the cart, so the browser never shows a stale total. */
export async function POST(request: Request) {
  if (!rateLimit(`quote:${clientIp(request)}`, 60, 60_000)) return tooMany();
  const body = await readJson<{ items?: unknown }>(request, 16_384);
  const lines = await priceLines(body?.items);
  return NextResponse.json({
    lines,
    total: lines.reduce((sum, l) => sum + l.lineTotal, 0),
  });
}
