import { cookies } from "next/headers";
import { currentAdminUsername } from "@/lib/admin-auth";
import { getOps, OPS_COOKIE, staffFromToken } from "@/lib/ops";

export type Actor = { name: string; admin: boolean; depts: string[]; can: (stage: string) => boolean };

/* Who is using the /ops board: a signed-in admin (sees everything) or floor staff (their departments). */
export async function opsActor(): Promise<Actor | null> {
  const config = await getOps();
  const deptOf = (stage: string) => config.stages.find((s) => s.id === stage)?.dept;

  const admin = await currentAdminUsername().catch(() => "");
  if (admin) return { name: admin, admin: true, depts: config.depts.map((d) => d.id), can: () => true };

  const staff = await staffFromToken((await cookies()).get(OPS_COOKIE)?.value);
  if (!staff) return null;
  return {
    name: staff.name,
    admin: false,
    depts: staff.depts,
    can: (stage) => staff.depts.includes(deptOf(stage) || ""),
  };
}
