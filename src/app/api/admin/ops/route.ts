import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOps, OpsError, publicOps, saveOps, type OpsConfigInput } from "@/lib/ops";
import { forbidden, readJson, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(publicOps(await getOps()));
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson<OpsConfigInput>(request, 200_000);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    return NextResponse.json(publicOps(await saveOps(body)));
  } catch (e) {
    if (e instanceof OpsError) return NextResponse.json({ error: e.message }, { status: 422 });
    console.error("[admin/ops]", e);
    return NextResponse.json({ error: "Couldn't save." }, { status: 500 });
  }
}
