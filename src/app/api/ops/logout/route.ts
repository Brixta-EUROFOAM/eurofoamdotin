import { NextResponse } from "next/server";
import { OPS_COOKIE } from "@/lib/ops";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/ops/login", request.url), 303);
  res.cookies.set(OPS_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
