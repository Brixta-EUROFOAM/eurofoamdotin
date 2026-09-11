import { NextResponse } from "next/server";
import { publicUrl } from "@/lib/public-url";
import { adminCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(publicUrl(request, "/admin/login"), 303);
  response.cookies.set(adminCookie.name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
