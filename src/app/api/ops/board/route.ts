import { NextResponse } from "next/server";
import { opsActor } from "@/lib/ops-session";
import { CANCELLED, dueAt, enteredAt, getOps } from "@/lib/ops";
import { listOrders } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Orders for the board: active ones in the viewer's departments, plus recently finished. */
export async function GET() {
  const me = await opsActor();
  if (!me) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const { depts, stages } = await getOps();
  const last = stages[stages.length - 1]?.id;
  const recent = Date.now() - 3 * 24 * 3600_000;

  const orders = (await listOrders())
    .filter((o) => {
      const done = o.status === last || o.status === CANCELLED;
      const touched = new Date(o.history?.at(-1)?.at || o.createdAt).getTime();
      if (done && touched < recent) return false;
      return me.admin || me.can(o.status);
    })
    .slice(0, 500)
    .map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      status: o.status,
      customer: { name: o.customer.name, phone: o.customer.phone, address: o.customer.address, city: o.customer.city, pincode: o.customer.pincode },
      payment: o.payment,
      total: o.total,
      notes: o.notes,
      lines: o.lines.map((l) => ({ name: l.name, size: l.size, height: l.height, variant: l.variant, quantity: l.quantity })),
      history: (o.history || []).slice(-30),
      enteredAt: enteredAt(o),
      dueAt: dueAt(o, stages),
    }));

  return NextResponse.json({
    me: { name: me.name, admin: me.admin, depts: me.depts },
    depts,
    stages,
    orders,
  });
}
