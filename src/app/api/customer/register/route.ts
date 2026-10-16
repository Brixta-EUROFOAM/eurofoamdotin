import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  createCustomerSession,
  registerCustomer
} from "@/lib/customerAuth";

import { clientIp, forbidden, rateLimit, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`register:${clientIp(request)}`, 5, 3600000)) return tooMany();
  try {
    const body = await request.json();

    const customer = await registerCustomer({
      name: String(body.name || ""),
      email: String(body.email || ""),
      mobile: String(body.mobile || ""),
      password: String(body.password || "")
    });

    const response = NextResponse.json({ customer });

    response.cookies.set(
      CUSTOMER_COOKIE,
      createCustomerSession(customer),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      }
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create account."
      },
      { status: 400 }
    );
  }
}
