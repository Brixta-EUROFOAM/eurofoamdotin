import { redirect } from "next/navigation";
import Link from "next/link";
import { hasAdminAccount, isAdminAuthenticated } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";
import { money } from "@/lib/catalog";
import { missingBusinessFields } from "@/lib/business";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!(await hasAdminAccount())) redirect("/admin/setup");
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const orders = await listOrders();
  const total = orders.reduce((sum, o) => sum + o.total, 0);
  const missing = missingBusinessFields();

  return (
    <main className="gp-orders">
      <header>
        <div>
          <p>GADDA ADMIN</p>
          <h1>Orders</h1>
          <span>
            {orders.length} order{orders.length === 1 ? "" : "s"} · {money(total)} total
          </span>
        </div>
        <nav>
          <Link href="/admin">← Back to admin</Link>
          <a href="/api/admin/orders" download>
            Orders CSV
          </a>
          <a href="/api/admin/leads?type=callbacks" download>
            Call-back requests CSV
          </a>
          <a href="/api/admin/leads?type=subscribers" download>
            Newsletter sign-ups CSV
          </a>
          <a href="/api/admin/leads?type=consent" download>
            Consent receipts CSV
          </a>
        </nav>
      </header>
      {missing.length ? (
        <p style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "#fff4e5", color: "#8a3b00", fontWeight: 600 }}>
          Legal details still missing on the website: {missing.join(", ")}. Add them in src/lib/business.ts.
        </p>
      ) : null}

      {orders.length ? (
        <div className="gp-orders-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Deliver to</th>
                <th>Items</th>
                <th>Payment</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.id}</strong>
                    <br />
                    {new Date(o.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <strong>{o.customer.name}</strong>
                    <br />
                    <a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a>
                    {" · "}
                    <a
                      href={`https://wa.me/${o.customer.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                    {o.customer.email ? (
                      <>
                        <br />
                        {o.customer.email}
                      </>
                    ) : null}
                  </td>
                  <td>
                    {o.customer.address}
                    <br />
                    {o.customer.city} {o.customer.pincode}
                  </td>
                  <td>
                    {o.lines.map((l, i) => (
                      <div key={i}>
                        {l.name} · {l.size} · {l.height}
                        {l.variant ? ` · ${l.variant}` : ""} × {l.quantity}
                      </div>
                    ))}
                    {o.notes ? <em>“{o.notes}”</em> : null}
                  </td>
                  <td>{o.payment === "upi_link" ? "Send UPI link" : "Pay on delivery"}</td>
                  <td className="num">
                    <strong>{money(o.total)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="gp-orders-empty">No orders yet. They appear here the moment someone checks out.</p>
      )}
    </main>
  );
}
