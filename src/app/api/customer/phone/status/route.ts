import { otpEnabled } from "@/lib/gadda-feature-flags";
import { NextRequest, NextResponse } from "next/server";
import { phoneOtpConfigured, phoneOtpRequired, phoneProofChannel, PHONE_COOKIE } from "@/lib/gadda-otp-phone";
import { whatsappOtpConfigured, quickSmsConfigured } from "@/lib/gadda-whatsapp";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (!otpEnabled()) return NextResponse.json({ otpEnabled: false, required: false, available: false, whatsappAvailable: false, smsAvailable: false, verified: false, verifiedChannel: null }, { headers: { "Cache-Control": "no-store" } });

  const phone = new URL(request.url).searchParams.get("phone") || "";
  const channel = phoneProofChannel(request.cookies.get(PHONE_COOKIE)?.value, phone);
  return NextResponse.json({ otpEnabled: true, required: phoneOtpRequired(), available: phoneOtpConfigured(),
    whatsappAvailable: whatsappOtpConfigured(), smsAvailable: quickSmsConfigured(),
    verified: channel !== null, verifiedChannel: channel }, { headers: { "Cache-Control": "no-store" } });
}
