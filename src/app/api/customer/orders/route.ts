import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_COOKIE, customerFromSession } from "@/lib/customerAuth";
import { ordersForCustomer } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The signed-in customer's own orders (no other customer's data, ever). */
export async function GET() {
  const jar = await cookies();
  const customer = await customerFromSession(jar.get(CUSTOMER_COOKIE)?.value);
  if (!customer) return NextResponse.json({ orders: [] }, { status: 401 });
  const orders = (await ordersForCustomer(customer.id)).map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    total: o.total,
    payment: o.payment,
    lines: o.lines.map((l) => ({ name: l.name, size: l.size, height: l.height, variant: l.variant, quantity: l.quantity })),
  }));
  return NextResponse.json({ orders });
}
