import { otpEnabled } from "@/lib/gadda-feature-flags";
import { NextRequest, NextResponse } from "next/server";
import { db, hasDb } from "@/lib/db";
import { CUSTOMER_COOKIE, createCustomerSession, customerFromSession, type Customer } from "@/lib/customerAuth";
import { OtpFailure } from "@/lib/gadda-otp";
import { PHONE_COOKIE, verifyPhoneOtp } from "@/lib/gadda-otp-phone";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!otpEnabled()) return NextResponse.json({ error: "OTP verification is currently disabled." }, { status: 503 });

  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`phone-otp-verify:${clientIp(request)}`, 30, 60 * 60_000)) return tooMany();
  const b = await readJson<{ phone?: string; code?: string; signIn?: boolean }>(request, 1024);
  if (!b) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    const verified = await verifyPhoneOtp(String(b.phone || ""), String(b.code || ""));
    const alreadySignedIn = await customerFromSession(request.cookies.get(CUSTOMER_COOKIE)?.value);
    let linkedCustomer: Customer | null = null;
    if (hasDb() && alreadySignedIn && verified.channel === "whatsapp") {
      // A signed-in account owner can link a number only after receiving its real WhatsApp code.
      // Do not allow claiming a number already verified for a different account.
      const { rows } = await (await db()).query(
        `update gadda.customers set mobile=$2,phone_verified_at=now()
         where id=$1 and not exists (
           select 1 from gadda.customers c where c.id<>$1 and c.phone_verified_at is not null
           and right(regexp_replace(c.mobile,'[^0-9]','','g'),10)=$2)
         returning id,name,email,mobile,created_at,email_verified_at,phone_verified_at`,
        [alreadySignedIn.id, verified.phone],
      );
      if (rows[0]) linkedCustomer = {
        id: rows[0].id, name: rows[0].name, email: rows[0].email, mobile: rows[0].mobile,
        createdAt: new Date(rows[0].created_at).toISOString(),
        emailVerifiedAt: rows[0].email_verified_at ? new Date(rows[0].email_verified_at).toISOString() : undefined,
        phoneVerifiedAt: new Date(rows[0].phone_verified_at).toISOString(),
      };
    } else if (hasDb() && b.signIn === true && verified.channel === "whatsapp") {
      // WhatsApp sign-in is available only for a previously verified, linked account.
      // Phone-only anonymous account creation is deliberately not performed.
      const { rows } = await (await db()).query(
        `select id,name,email,mobile,created_at,email_verified_at,phone_verified_at
         from gadda.customers where phone_verified_at is not null
         and right(regexp_replace(mobile,'[^0-9]','','g'),10)=$1 limit 2`,
        [verified.phone],
      );
      if (rows.length === 1) linkedCustomer = {
        id: rows[0].id, name: rows[0].name, email: rows[0].email, mobile: rows[0].mobile,
        createdAt: new Date(rows[0].created_at).toISOString(),
        emailVerifiedAt: rows[0].email_verified_at ? new Date(rows[0].email_verified_at).toISOString() : undefined,
        phoneVerifiedAt: new Date(rows[0].phone_verified_at).toISOString(),
      };
    }
    if (b.signIn === true && verified.channel !== "whatsapp") return NextResponse.json({ error: "Use WhatsApp OTP or email OTP for account sign-in." }, { status: 422 });
    const response = NextResponse.json({ ok: true, verified: true, channel: verified.channel, accountLinked: Boolean(linkedCustomer),
      ...(b.signIn === true && linkedCustomer ? { customer: linkedCustomer } : {}) });
    response.cookies.set(PHONE_COOKIE, verified.proof, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 3600,
    });
    if (b.signIn === true && linkedCustomer) response.cookies.set(CUSTOMER_COOKIE, createCustomerSession(linkedCustomer), {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (e) {
    if (e instanceof OtpFailure) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[gadda whatsapp otp] Verification failed", (e as Error).name);
    return NextResponse.json({ error: "Could not verify WhatsApp code." }, { status: 503 });
  }
}
