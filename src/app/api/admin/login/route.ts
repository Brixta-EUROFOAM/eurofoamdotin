import { NextResponse } from "next/server";
import { publicUrl } from "@/lib/public-url";
import {
  adminCookie,
  createSessionToken,
  hasAdminAccount,
  verifyAdminCredentials
} from "@/lib/admin-auth";

export const runtime = "nodejs";

const failures = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: Request) {
  if (!(await hasAdminAccount())) {
    return NextResponse.redirect(publicUrl(request, "/admin/setup"), 303);
  }

  const key = clientKey(request);
  const now = Date.now();
  const current = failures.get(key);

  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return NextResponse.redirect(publicUrl(request, "/admin/login?locked=1"), 303);
  }

  const form = await request.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");

  if (!(await verifyAdminCredentials(username, password))) {
    const existing =
      current && current.resetAt > now
        ? current
        : { count: 0, resetAt: now + WINDOW_MS };

    failures.set(key, {
      count: existing.count + 1,
      resetAt: existing.resetAt
    });

    return NextResponse.redirect(publicUrl(request, "/admin/login?error=1"), 303);
  }

  failures.delete(key);

  const response = NextResponse.redirect(publicUrl(request, "/admin"), 303);
  response.cookies.set(adminCookie.name, createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminCookie.maxAge
  });

  return response;
}
