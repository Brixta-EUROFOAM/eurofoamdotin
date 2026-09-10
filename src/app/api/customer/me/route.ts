import { type NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  customerFromSession
} from "@/lib/customerAuth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  const customer = await customerFromSession(token);

  return NextResponse.json({ customer });
}
