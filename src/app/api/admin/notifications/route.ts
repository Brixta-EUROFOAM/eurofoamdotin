import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminNotificationStatus, retryFailedAdminNotifications } from "@/lib/admin-notify";
import { sameOrigin, forbidden } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await adminNotificationStatus(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const outcome = await retryFailedAdminNotifications(10);
  return NextResponse.json(outcome, { headers: { "Cache-Control": "no-store" } });
}
