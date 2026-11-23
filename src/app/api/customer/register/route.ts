import { NextResponse } from "next/server";
/** Password registration was superseded by email OTP. Existing password login remains supported. */
export const runtime = "nodejs";
export async function POST() {
  return NextResponse.json({ error: "Use the six-digit email verification flow to create your account.", emailOtp: true }, { status: 410 });
}
