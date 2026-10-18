import { NextResponse } from "next/server";
import { opsActor } from "@/lib/ops-session";
import { OpsError } from "@/lib/ops";
import { actOnOrder, type OrderAction } from "@/lib/orders";
import { forbidden, readJson, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  const me = await opsActor();
  if (!me) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const body = await readJson<{ id?: string } & Record<string, unknown>>(request, 2048);
  if (!body?.id) return NextResponse.json({ error: "Missing order." }, { status: 400 });
  try {
    const order = await actOnOrder(String(body.id), body as unknown as OrderAction, me);
    return NextResponse.json({ ok: true, status: order.status });
  } catch (e) {
    if (e instanceof OpsError) return NextResponse.json({ error: e.message }, { status: 422 });
    console.error("[ops/act]", e);
    return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 500 });
  }
}
