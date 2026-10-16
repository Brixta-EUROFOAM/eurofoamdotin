import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_COOKIE, customerFromSession, deleteCustomer } from "@/lib/customerAuth";
import { ordersForCustomer } from "@/lib/orders";
import { clientIp, forbidden, rateLimit, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  Data-principal rights under the DPDP Act:
  GET    → a copy of everything we hold about the signed-in customer
  DELETE → erase the account (orders stay for tax records, unlinked)
*/
export async function GET() {
  const jar = await cookies();
  const customer = await customerFromSession(jar.get(CUSTOMER_COOKIE)?.value);
  if (!customer) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const orders = await ordersForCustomer(customer.id);
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), account: customer, orders }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="gadda-my-data.json"`,
    },
  });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`erase:${clientIp(request)}`, 3, 60 * 60_000)) return tooMany();
  const jar = await cookies();
  const customer = await customerFromSession(jar.get(CUSTOMER_COOKIE)?.value);
  if (!customer) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  await deleteCustomer(customer.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return res;
}
