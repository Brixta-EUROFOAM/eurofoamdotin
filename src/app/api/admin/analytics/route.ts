import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { analyticsSummary } from "@/lib/telemetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);

  const days = Math.max(
    1,
    Math.min(
      365,
      Number(url.searchParams.get("days") || 30)
    )
  );

  return NextResponse.json({
    analytics: await analyticsSummary(days)
  });
}
