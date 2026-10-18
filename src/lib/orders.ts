import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { dataDir, getStoreData } from "@/lib/store";
import type { Mattress } from "@/lib/catalog";
import { db, hasDb } from "@/lib/db";
import { CANCELLED, getOps, OpsError } from "@/lib/ops";

/*
  Orders, saved one per line in data/orders.jsonl (same storage style as
  the rest of the site; moves to Postgres with the database upgrade).
  Prices are ALWAYS recalculated here from the catalogue — whatever the
  browser sends as a price is ignored.
*/

export type OrderLine = {
  slug: string;
  name: string;
  size: string;
  height: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  createdAt: string;
  /* id of a stage in Operations settings (src/lib/ops.ts), or "cancelled" */
  status: string;
  /* every move, accept and note from the /ops board */
  history?: OrderEvent[];
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pincode: string;
  };
  payment: "pay_on_delivery" | "upi_link";
  notes?: string;
  /* signed-in customer, if any */
  customerId?: string;
  /* when the buyer ticked "I agree to the Terms of Sale" */
  termsAcceptedAt?: string;
  /* opted in to order updates on WhatsApp (separate, optional consent) */
  whatsappUpdates?: boolean;
  /* client-generated key so a double-click can't create two orders */
  idempotencyKey?: string;
  lines: OrderLine[];
  total: number;
};

export type OrderEvent = {
  at: string;
  by: string;
  stage: string;
  event: "moved" | "accepted" | "note" | "cancelled";
  note?: string;
};

type InLine = { slug?: unknown; size?: unknown; height?: unknown; variant?: unknown; quantity?: unknown };

const file = () => path.join(dataDir(), "orders.jsonl");

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

function priceFor(product: Mattress, size: string, height: string, variant: string) {
  const sizeRow = product.sizes.find((s) => s.label === size);
  const heightRow = product.heights.find((h) => h.label === height);
  if (!sizeRow || !heightRow) return null;
  const picked = variant ? variant.split(" · ").map((v) => v.trim()) : [];
  let extra = 0;
  const cleanVariant: string[] = [];
  for (const option of product.options || []) {
    const choice = option.choices.find((c) => picked.includes(c.label)) || option.choices[0];
    if (choice) {
      extra += choice.priceAdd;
      cleanVariant.push(choice.label);
    }
  }
  return {
    unit: product.basePrice + sizeRow.priceAdd + heightRow.priceAdd + extra,
    variant: cleanVariant.join(" · "),
  };
}

export class OrderError extends Error {}

/* Re-price cart lines from the live catalogue. Unknown/stale lines are dropped. */
export async function priceLines(input: unknown): Promise<OrderLine[]> {
  const { products } = await getStoreData();
  const raw = Array.isArray(input) ? (input as InLine[]).slice(0, 20) : [];
  const lines: OrderLine[] = [];
  for (const item of raw) {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) continue;
    const size = clip(item.size, 40);
    const height = clip(item.height, 40);
    const priced = priceFor(product, size, height, clip(item.variant, 120));
    if (!priced) continue;
    const quantity = Math.max(1, Math.min(10, Math.floor(Number(item.quantity) || 1)));
    lines.push({
      slug: product.slug,
      name: product.name,
      size,
      height,
      variant: priced.variant || undefined,
      quantity,
      unitPrice: priced.unit,
      lineTotal: priced.unit * quantity,
    });
  }
  return lines;
}

export async function createOrder(
  body: Record<string, unknown>,
  meta: { customerId?: string } = {}
): Promise<Order> {
  const name = clip(body.name, 80);
  const phone = clip(body.phone, 20).replace(/[^\d+]/g, "");
  const address = clip(body.address, 300);
  const city = clip(body.city, 80);
  const pincode = clip(body.pincode, 6).replace(/\D/g, "");
  const email = clip(body.email, 120);
  const notes = clip(body.notes, 500);
  const payment = body.payment === "upi_link" ? "upi_link" : "pay_on_delivery";

  if (!name || !address || !city) throw new OrderError("Please fill in your name, address and city.");
  if (phone.replace(/\D/g, "").length < 10) throw new OrderError("Please enter a valid 10-digit phone number.");
  if (!/^[1-9]\d{5}$/.test(pincode)) throw new OrderError("Please enter a valid 6-digit PIN code.");
  if (body.acceptTerms !== true) throw new OrderError("Please accept the Terms of Sale to place the order.");
  const idempotencyKey = clip(body.idempotencyKey, 64).replace(/[^a-zA-Z0-9-]/g, "");
  if (idempotencyKey) {
    const existing = hasDb()
      ? ((await (await db()).query("select data from gadda.orders where idempotency_key = $1", [idempotencyKey])).rows[0]
          ?.data as Order | undefined)
      : (await listOrders()).find((o) => o.idempotencyKey === idempotencyKey);
    if (existing) return existing;
  }

  const lines = await priceLines(body.items);
  if (!lines.length) throw new OrderError("Your cart is empty or out of date. Please add the mattress again.");

  const d = new Date();
  const id = `GD-${d.toISOString().slice(2, 10).replace(/-/g, "")}-${randomBytes(2).toString("hex").toUpperCase()}`;

  const order: Order = {
    id,
    createdAt: d.toISOString(),
    status: (await getOps()).stages[0]?.id || "new",
    customer: { name, phone, email: email || undefined, address, city, pincode },
    payment,
    notes: notes || undefined,
    customerId: meta.customerId,
    termsAcceptedAt: d.toISOString(),
    whatsappUpdates: body.whatsappUpdates === true,
    idempotencyKey: idempotencyKey || undefined,
    lines,
    total: lines.reduce((sum, l) => sum + l.lineTotal, 0),
  };

  if (hasDb()) {
    await insertOrder(order);
    return order;
  }
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.appendFile(file(), JSON.stringify(order) + "\n", "utf-8");
  return order;
}

/* Insert one order row (also used by the one-time file import). */
export async function insertOrder(order: Order) {
  await (await db()).query(
    `insert into gadda.orders (id, created_at, status, customer_id, phone, pincode, total, idempotency_key, data)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9) on conflict do nothing`,
    [order.id, order.createdAt, order.status, order.customerId ?? null, order.customer.phone,
     order.customer.pincode, order.total, order.idempotencyKey ?? null, JSON.stringify(order)]
  );
}

export async function listOrders(): Promise<Order[]> {
  if (hasDb()) {
    const { rows } = await (await db()).query(
      "select data, status from gadda.orders order by created_at desc limit 5000"
    );
    return rows.map((r) => ({ ...(r.data as Order), status: r.status }));
  }
  return listOrderFile();
}

export async function listOrderFile(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(file(), "utf-8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Order;
        } catch {
          return null;
        }
      })
      .filter((o): o is Order => Boolean(o))
      .reverse();
  } catch {
    return [];
  }
}

/* Public order lookup: needs the order id AND the phone it was placed with. */
export async function findOrderForTracking(id: string, phone: string) {
  const cleanId = id.trim().toUpperCase().slice(0, 30);
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (!cleanId || digits.length !== 10) return null;
  const order = hasDb()
    ? ((await (await db()).query("select data, status from gadda.orders where id = $1", [cleanId])).rows.map(
        (r) => ({ ...(r.data as Order), status: r.status })
      )[0] as Order | undefined)
    : (await listOrders()).find((o) => o.id === cleanId);
  if (!order || order.customer.phone.replace(/\D/g, "").slice(-10) !== digits) return null;
  return order;
}

export async function ordersForCustomer(customerId: string) {
  if (hasDb()) {
    const { rows } = await (await db()).query(
      "select data, status from gadda.orders where customer_id = $1 order by created_at desc",
      [customerId]
    );
    return rows.map((r) => ({ ...(r.data as Order), status: r.status })) as Order[];
  }
  return (await listOrders()).filter((o) => o.customerId === customerId);
}

/* WhatsApp link to the business with the order summary, if a real number is set. */
export function whatsappFor(phone: string, order: Order) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 10 || /^9?1?0+$/.test(digits)) return null;
  const to = digits.length === 10 ? `91${digits}` : digits;
  const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const text = [
    `Hi GADDA! I just placed order ${order.id}.`,
    ...order.lines.map(
      (l) => `• ${l.name} · ${l.size} · ${l.height}${l.variant ? ` · ${l.variant}` : ""} × ${l.quantity} = ${rupees(l.lineTotal)}`
    ),
    `Total: ${rupees(order.total)}`,
    `Payment: ${order.payment === "upi_link" ? "UPI link" : "Pay on delivery"}`,
    `${order.customer.name}, ${order.customer.city} ${order.customer.pincode}`,
  ].join("\n");
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

/* ---------- moving orders through stages (used by the /ops board) ---------- */

export async function getOrder(id: string): Promise<Order | null> {
  if (hasDb()) {
    const { rows } = await (await db()).query("select data, status from gadda.orders where id = $1", [id]);
    return rows[0] ? ({ ...(rows[0].data as Order), status: rows[0].status } as Order) : null;
  }
  return (await listOrderFile()).find((o) => o.id === id) || null;
}

async function saveOrder(order: Order) {
  if (hasDb()) {
    await (await db()).query("update gadda.orders set status = $2, data = $3 where id = $1", [
      order.id,
      order.status,
      JSON.stringify(order),
    ]);
    return;
  }
  const all = (await listOrderFile()).reverse(); // back to oldest-first file order
  const next = all.map((o) => (o.id === order.id ? order : o));
  const tmp = `${file()}.tmp`;
  await fs.writeFile(tmp, next.map((o) => JSON.stringify(o)).join("\n") + "\n", "utf-8");
  await fs.rename(tmp, file());
}

export type OrderAction =
  | { action: "accept" }
  | { action: "advance" }
  | { action: "set"; stage: string }
  | { action: "note"; note: string }
  | { action: "cancel"; note?: string };

/*
  Apply one board action. `can(stageId)` says whether this person may act
  on an order sitting in that stage (their department); admins pass () => true.
*/
export async function actOnOrder(
  id: string,
  act: OrderAction,
  who: { name: string; admin: boolean; can: (stage: string) => boolean }
): Promise<Order> {
  const order = await getOrder(id);
  if (!order) throw new OpsError("Order not found.");
  const { stages } = await getOps();
  const i = stages.findIndex((s) => s.id === order.status);
  const now = new Date().toISOString();
  const note = "note" in act && act.note ? String(act.note).replace(/[\r\n]+/g, " ").trim().slice(0, 300) : undefined;
  const history = [...(order.history || [])];

  if (!who.admin && !who.can(order.status)) throw new OpsError("This order isn't in your department right now.");

  switch (act.action) {
    case "accept":
      history.push({ at: now, by: who.name, stage: order.status, event: "accepted" });
      break;
    case "note":
      if (!note) throw new OpsError("Write a note first.");
      history.push({ at: now, by: who.name, stage: order.status, event: "note", note });
      break;
    case "advance": {
      if (order.status === CANCELLED) throw new OpsError("This order is cancelled.");
      const next = stages[i + 1];
      if (!next) throw new OpsError("Already at the last stage.");
      order.status = next.id;
      history.push({ at: now, by: who.name, stage: next.id, event: "moved" });
      break;
    }
    case "set": {
      if (!who.admin) throw new OpsError("Only admins can jump stages.");
      if (!stages.some((s) => s.id === act.stage)) throw new OpsError("Unknown stage.");
      order.status = act.stage;
      history.push({ at: now, by: who.name, stage: act.stage, event: "moved" });
      break;
    }
    case "cancel":
      if (!who.admin) throw new OpsError("Only admins can cancel orders.");
      order.status = CANCELLED;
      history.push({ at: now, by: who.name, stage: CANCELLED, event: "cancelled", note });
      break;
    default:
      throw new OpsError("Unknown action.");
  }
  order.history = history.slice(-200);
  await saveOrder(order);
  return order;
}
