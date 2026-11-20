import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readCampaignSpend, saveCampaignSpend, validSpendRow } from "@/lib/ad-spend";
import { forbidden, readJson, sameOrigin } from "@/lib/security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return forbidden();
  const data = await readJson<Record<string,unknown>>(request, 2048);
  const row = validSpendRow(data);
  if (!row) return NextResponse.json({ error: "Invalid source, campaign, date range or spend amount." }, { status: 422 });
  const rows = await readCampaignSpend();
  const key = (x: typeof row) => `${x.source}|${x.campaign.toLowerCase()}|${x.start}|${x.end}`;
  const idx = rows.findIndex(x => key(x) === key(row));
  if (idx >= 0) rows[idx] = row; else rows.push(row);
  if (rows.length > 500) return NextResponse.json({ error: "Too many entries." }, { status: 422 });
  await saveCampaignSpend(rows);
  return NextResponse.json({ ok: true });
}
