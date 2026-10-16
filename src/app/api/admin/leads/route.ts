import { promises as fs } from "fs";
import path from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { dataDir } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILES = { callbacks: "callbacks.jsonl", subscribers: "subscribers.jsonl", consent: "consent.jsonl" } as const;

/* Admin-only CSV export of call-back requests, newsletter sign-ups and consent receipts. */
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return new Response("Unauthorized", { status: 401 });
  const type = new URL(request.url).searchParams.get("type") as keyof typeof FILES;
  const file = FILES[type];
  if (!file) return new Response("Unknown type", { status: 400 });

  let rows: Record<string, unknown>[] = [];
  try {
    rows = (await fs.readFile(path.join(dataDir(), file), "utf-8"))
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {}

  const head = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [head.join(","), ...rows.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gadda-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
