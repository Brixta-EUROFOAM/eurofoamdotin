import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { db, hasDb } from "@/lib/db";
import { dataDir } from "@/lib/store";
import { sessionSecret } from "@/lib/admin-auth";

/*
  Operations: departments, the stages every order moves through (each
  owned by one department, each with a turnaround time), and the floor
  staff who move orders on the /ops board with a name + PIN.

  Stored in gadda.meta (key "ops") or data/ops.json without a database.
  Customer tracking is driven entirely by these stages.
*/

export type Dept = { id: string; name: string; color: string };

export type Stage = {
  id: string;
  label: string; // what staff see
  dept: string; // Dept.id that owns this stage
  tatHours: number; // turnaround time allowed in this stage
  customerLabel: string; // what the customer sees on Track order
  showCustomer: boolean;
};

export type StaffMember = {
  id: string;
  name: string;
  depts: string[];
  active: boolean;
  salt: string;
  pinHash: string;
};

export type OpsConfig = { depts: Dept[]; stages: Stage[]; staff: StaffMember[] };

/* What the admin screen sends/receives: no hashes, optional new PIN. */
export type StaffInput = Omit<StaffMember, "salt" | "pinHash"> & { pin?: string; hasPin?: boolean };
export type OpsConfigInput = { depts: Dept[]; stages: Stage[]; staff: StaffInput[] };

export const CANCELLED = "cancelled";

export const DEFAULT_OPS: OpsConfig = {
  depts: [
    { id: "sales", name: "Sales desk", color: "#3a4fd6" },
    { id: "factory", name: "Factory", color: "#e8590c" },
    { id: "warehouse", name: "Warehouse", color: "#8a6d1f" },
    { id: "logistics", name: "Logistics", color: "#1f7a4d" },
  ],
  stages: [
    { id: "new", label: "New order", dept: "sales", tatHours: 4, customerLabel: "Order received", showCustomer: true },
    { id: "confirmed", label: "Confirmed on call", dept: "sales", tatHours: 12, customerLabel: "Confirmed", showCustomer: true },
    { id: "production", label: "In production", dept: "factory", tatHours: 48, customerLabel: "Being made", showCustomer: true },
    { id: "qc", label: "Quality check & packing", dept: "factory", tatHours: 12, customerLabel: "Checked and packed", showCustomer: true },
    { id: "warehouse", label: "Ready at warehouse", dept: "warehouse", tatHours: 24, customerLabel: "Ready to ship", showCustomer: false },
    { id: "dispatched", label: "Out for delivery", dept: "logistics", tatHours: 72, customerLabel: "On its way", showCustomer: true },
    { id: "delivered", label: "Delivered", dept: "logistics", tatHours: 0, customerLabel: "Delivered", showCustomer: true },
  ],
  staff: [],
};

/* ---------- storage ---------- */

const file = () => path.join(dataDir(), "ops.json");

export async function getOps(): Promise<OpsConfig> {
  try {
    let raw: unknown = null;
    if (hasDb()) {
      const { rows } = await (await db()).query("select value from gadda.meta where key = 'ops'");
      raw = rows[0] ? JSON.parse(rows[0].value) : null;
    } else {
      raw = JSON.parse(await fs.readFile(file(), "utf-8"));
    }
    const c = raw as OpsConfig | null;
    if (c && Array.isArray(c.stages) && c.stages.length && Array.isArray(c.depts)) {
      return { depts: c.depts, stages: c.stages, staff: Array.isArray(c.staff) ? c.staff : [] };
    }
  } catch {
    /* fall through to defaults */
  }
  return DEFAULT_OPS;
}

async function writeOps(c: OpsConfig) {
  const json = JSON.stringify(c);
  if (hasDb()) {
    await (await db()).query(
      `insert into gadda.meta (key, value, at) values ('ops', $1, now())
       on conflict (key) do update set value = excluded.value, at = now()`,
      [json]
    );
    return;
  }
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(file(), json, "utf-8");
}

/* ---------- validation ---------- */

const slug = (v: unknown, fallback: string) =>
  (String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || fallback);
const txt = (v: unknown, n: number) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
const hashPin = (pin: string, salt: string) => crypto.scryptSync(pin, salt, 32).toString("hex");

export class OpsError extends Error {}

export async function saveOps(input: OpsConfigInput): Promise<OpsConfig> {
  const current = await getOps();
  const deptIds = new Set<string>();
  const depts: Dept[] = (input.depts || []).slice(0, 20).map((d, i) => {
    let id = slug(d.id || d.name, `dept-${i + 1}`);
    while (deptIds.has(id)) id += "-2";
    deptIds.add(id);
    return { id, name: txt(d.name, 40) || `Department ${i + 1}`, color: /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#555555" };
  });
  if (!depts.length) throw new OpsError("Add at least one department.");

  const stageIds = new Set<string>([CANCELLED]);
  const stages: Stage[] = (input.stages || []).slice(0, 30).map((s, i) => {
    let id = slug(s.id || s.label, `stage-${i + 1}`);
    while (stageIds.has(id)) id += "-2";
    stageIds.add(id);
    const label = txt(s.label, 50) || `Stage ${i + 1}`;
    return {
      id,
      label,
      dept: deptIds.has(s.dept) ? s.dept : depts[0].id,
      tatHours: Math.max(0, Math.min(24 * 60, Math.round(Number(s.tatHours) || 0))),
      customerLabel: txt(s.customerLabel, 50) || label,
      showCustomer: s.showCustomer !== false,
    };
  });
  if (stages.length < 2) throw new OpsError("Keep at least two stages (for example New and Delivered).");

  const staff: StaffMember[] = [];
  for (const s of (input.staff || []).slice(0, 200)) {
    const name = txt(s.name, 40);
    if (!name) continue;
    if (staff.some((x) => x.name.toLowerCase() === name.toLowerCase())) throw new OpsError(`Two staff are called "${name}".`);
    const old = current.staff.find((x) => x.id === s.id);
    let salt = old?.salt || "";
    let pinHash = old?.pinHash || "";
    if (s.pin) {
      if (!/^\d{4,8}$/.test(s.pin)) throw new OpsError(`PIN for ${name} must be 4 to 8 digits.`);
      salt = crypto.randomBytes(12).toString("hex");
      pinHash = hashPin(s.pin, salt);
    }
    if (!pinHash) throw new OpsError(`Set a PIN for ${name}.`);
    staff.push({
      id: old?.id || crypto.randomBytes(6).toString("hex"),
      name,
      depts: (s.depts || []).filter((d) => deptIds.has(d)),
      active: s.active !== false,
      salt,
      pinHash,
    });
  }

  const next = { depts, stages, staff };
  await writeOps(next);
  return next;
}

export function publicOps(c: OpsConfig): OpsConfigInput {
  return {
    depts: c.depts,
    stages: c.stages,
    staff: c.staff.map(({ salt: _s, pinHash, ...rest }) => ({ ...rest, hasPin: Boolean(pinHash) })),
  };
}

/* ---------- floor staff sessions ---------- */

export const OPS_COOKIE = "gadda_ops";
const OPS_TTL = 14 * 24 * 60 * 60 * 1000;

function sign(body: string) {
  return crypto.createHmac("sha256", `ops:${sessionSecret()}`).update(body).digest("base64url");
}

export async function loginStaff(name: string, pin: string): Promise<{ token: string; staff: StaffMember } | null> {
  const { staff } = await getOps();
  const who = staff.find((s) => s.active && s.name.toLowerCase() === name.trim().toLowerCase());
  const salt = who?.salt || "0000";
  const hash = hashPin(String(pin).slice(0, 8), salt);
  const expected = Buffer.from(who?.pinHash || "0".repeat(64), "hex");
  const ok = expected.length === 32 && crypto.timingSafeEqual(Buffer.from(hash, "hex"), expected);
  if (!who || !ok) return null;
  const body = Buffer.from(JSON.stringify({ id: who.id, exp: Date.now() + OPS_TTL })).toString("base64url");
  return { token: `${body}.${sign(body)}`, staff: who };
}

export async function staffFromToken(token?: string): Promise<StaffMember | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const good = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !crypto.timingSafeEqual(good, given)) return null;
  try {
    const { id, exp } = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof exp !== "number" || exp < Date.now()) return null;
    const { staff } = await getOps();
    return staff.find((s) => s.id === id && s.active) || null;
  } catch {
    return null;
  }
}

export const opsCookie = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: OPS_TTL / 1000 };

/* ---------- turnaround maths ---------- */

type HistoryLike = { history?: { stage: string; at: string; event: string }[]; createdAt: string; status: string };

/* When the order entered the stage it is in now. */
export function enteredAt(o: HistoryLike) {
  const h = (o.history || []).filter((e) => e.event === "moved" && e.stage === o.status);
  return h.length ? h[h.length - 1].at : o.createdAt;
}

export function dueAt(o: HistoryLike, stages: Stage[]) {
  const s = stages.find((x) => x.id === o.status);
  if (!s || !s.tatHours) return null;
  return new Date(new Date(enteredAt(o)).getTime() + s.tatHours * 3600_000).toISOString();
}

/* Estimated finish: time left in this stage + every remaining stage's TAT. */
export function eta(o: HistoryLike, stages: Stage[]) {
  const i = stages.findIndex((x) => x.id === o.status);
  if (i < 0 || i === stages.length - 1) return null;
  const due = dueAt(o, stages);
  let t = Math.max(Date.now(), due ? new Date(due).getTime() : Date.now());
  for (const s of stages.slice(i + 1, -1)) t += s.tatHours * 3600_000;
  return new Date(t).toISOString();
}

/* Customer-facing timeline (only stages marked "show to customer"). */
export function customerTimeline(o: HistoryLike, stages: Stage[]) {
  const at = stages.findIndex((s) => s.id === o.status);
  const reached = new Map<string, string>();
  for (const e of o.history || []) if (e.event === "moved") reached.set(e.stage, e.at);
  if (!reached.has(stages[0]?.id)) reached.set(stages[0]?.id, o.createdAt);
  return stages
    .map((s, i) => ({ s, i }))
    .filter(({ s, i }) => s.showCustomer || i === at)
    .map(({ s, i }) => ({
      label: s.customerLabel,
      done: i < at || (i === at && i === stages.length - 1),
      current: i === at,
      at: i <= at ? reached.get(s.id) || null : null,
    }));
}

/* Average hours each stage actually took, from order history. */
export function stageReport(orders: (HistoryLike & { id: string })[], stages: Stage[]) {
  const spent = new Map<string, number[]>();
  for (const o of orders) {
    const moves = (o.history || []).filter((e) => e.event === "moved");
    let prevStage = stages[0]?.id;
    let prevAt = o.createdAt;
    for (const m of moves) {
      if (prevStage && m.stage !== prevStage) {
        const h = (new Date(m.at).getTime() - new Date(prevAt).getTime()) / 3600_000;
        if (h >= 0) spent.set(prevStage, [...(spent.get(prevStage) || []), h]);
      }
      prevStage = m.stage;
      prevAt = m.at;
    }
  }
  const now = Date.now();
  return stages.map((s) => {
    const list = spent.get(s.id) || [];
    const active = orders.filter((o) => o.status === s.id);
    const overdue = active.filter((o) => {
      const d = dueAt(o, stages);
      return d && new Date(d).getTime() < now;
    }).length;
    const avg = list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
    const onTime = s.tatHours && list.length ? list.filter((h) => h <= s.tatHours).length / list.length : null;
    return { id: s.id, label: s.label, dept: s.dept, tatHours: s.tatHours, active: active.length, overdue, avgHours: avg, onTime, samples: list.length };
  });
}
