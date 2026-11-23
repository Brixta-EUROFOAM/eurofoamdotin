import { otpEnabled } from "@/lib/gadda-feature-flags";
import { NextResponse } from "next/server";
import { OtpFailure } from "@/lib/gadda-otp";
import { normalizedPhone, sendPhoneOtp } from "@/lib/gadda-otp-phone";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!otpEnabled()) return NextResponse.json({ error: "OTP verification is currently disabled." }, { status: 503 });

  if (!sameOrigin(request)) return forbidden();
  const b = await readJson<{ phone?: string; channel?: string }>(request, 1024);
  if (!b) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const phone = normalizedPhone(String(b.phone || ""));
  if (!phone) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 422 });
  if (b.channel !== undefined && b.channel !== "whatsapp" && b.channel !== "sms") {
    return NextResponse.json({ error: "Unsupported delivery channel." }, { status: 422 });
  }
  if (!rateLimit(`phone-otp-ip:${clientIp(request)}`, 12, 60 * 60_000)) return tooMany();
  try { return NextResponse.json(await sendPhoneOtp(phone, b.channel === "sms" ? "sms" : "whatsapp")); }
  catch (e) {
    if (e instanceof OtpFailure) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[gadda otp] Fast2SMS send failed", (e as Error).name);
    return NextResponse.json({ error: "Could not send verification code." }, { status: 503 });
  }
}
