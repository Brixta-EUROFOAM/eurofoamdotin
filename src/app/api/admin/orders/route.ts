import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* All orders as a CSV download (admins only). */
export async function GET() {
  if (!(await isAdminAuthenticated())) return new Response("Unauthorized", { status: 401 });
  const orders = await listOrders();
  const esc = (v: unknown) => {
    let s = v == null ? "" : String(v);
    // Block spreadsheet formula injection from customer-typed fields.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ["order", "date", "status", "name", "phone", "email", "address", "city", "pincode", "payment", "items", "total", "notes"];
  const rows = orders.map((o) =>
    [
      o.id,
      o.createdAt,
      o.status,
      o.customer.name,
      o.customer.phone,
      o.customer.email || "",
      o.customer.address,
      o.customer.city,
      o.customer.pincode,
      o.payment,
      o.lines.map((l) => `${l.name} ${l.size} ${l.height}${l.variant ? ` ${l.variant}` : ""} x${l.quantity}`).join("; "),
      o.total,
      o.notes || "",
    ]
      .map(esc)
      .join(",")
  );
  return new Response([head.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gadda-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
