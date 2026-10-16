import { NextResponse } from "next/server";
import {
  createSessionToken,
  adminCookie,
  isAdminAuthenticated,
  updateAdminAccount
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    currentPassword?: string;
    username?: string;
    newPassword?: string;
  };

  const username = String(body.username || "").trim();
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  if (username.length < 3 || !currentPassword) {
    return NextResponse.json({ error: "Username and current password are required." }, { status: 400 });
  }

  if (newPassword && newPassword.length < 10) {
    return NextResponse.json({ error: "New password must be at least 10 characters." }, { status: 400 });
  }

  try {
    await updateAdminAccount({
      currentPassword,
      username,
      newPassword: newPassword || undefined
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookie.name, createSessionToken(username), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: adminCookie.maxAge
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Account update failed." },
      { status: 400 }
    );
  }
}
