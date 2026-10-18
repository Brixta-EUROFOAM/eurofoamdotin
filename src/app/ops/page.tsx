import { redirect } from "next/navigation";
import OpsBoard from "@/components/ops/OpsBoard";
import { opsActor } from "@/lib/ops-session";

export const dynamic = "force-dynamic";

/* The order board for sales desk, factory, warehouse and logistics. */
export default async function OpsPage() {
  if (!(await opsActor())) redirect("/ops/login");
  return <OpsBoard />;
}
