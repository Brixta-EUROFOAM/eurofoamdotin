import { NextResponse } from "next/server";
import { loginStaff, OPS_COOKIE, opsCookie } from "@/lib/ops";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbidden();
  if (!rateLimit(`opslogin:${clientIp(request)}`, 10, 15 * 60_000)) return tooMany();
  const body = await readJson<{ name?: string; pin?: string }>(request, 512);
  const result = await loginStaff(String(body?.name || ""), String(body?.pin || ""));
  if (!result) return NextResponse.json({ error: "Wrong name or PIN." }, { status: 401 });
  const res = NextResponse.json({ ok: true, name: result.staff.name });
  res.cookies.set(OPS_COOKIE, result.token, opsCookie);
  return res;
}
