import { redirect } from "next/navigation";
import OpsSettings from "@/components/ops/OpsSettings";
import { hasAdminAccount, isAdminAuthenticated } from "@/lib/admin-auth";
import { getOps, publicOps, stageReport } from "@/lib/ops";
import { listOrders } from "@/lib/orders";
import "../../ops/ops.css";

export const dynamic = "force-dynamic";

export default async function AdminOpsPage() {
  if (!(await hasAdminAccount())) redirect("/admin/setup");
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const config = await getOps();
  const since = Date.now() - 90 * 24 * 3600_000;
  const orders = (await listOrders()).filter((o) => new Date(o.createdAt).getTime() >= since);

  return (
    <main className="op">
      <div className="op-top">
        <span className="op-brand">
          GADDA <small>OPS</small>
        </span>
        <span className="op-me">Settings</span>
        <span className="op-sp" />
        <a href="/ops">Open the board</a>
        <a href="/admin/orders">Orders</a>
        <a href="/admin">Admin</a>
      </div>
      <OpsSettings initial={publicOps(config)} report={stageReport(orders, config.stages)} />
    </main>
  );
}
