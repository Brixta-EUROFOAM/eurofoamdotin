import { NextResponse } from "next/server";
import { turnstileEnforced } from "@/lib/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Site key is public. Never return the secret. Config is read at runtime. */
export function GET() {
  return NextResponse.json(
    { siteKey: process.env.TURNSTILE_SITE_KEY?.trim() || "", enforced: turnstileEnforced() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
