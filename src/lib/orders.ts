import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { dataDir, getStoreData } from "@/lib/store";
import type { Mattress } from "@/lib/catalog";

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
  status: "new" | "confirmed" | "dispatched" | "delivered" | "cancelled";
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
  lines: OrderLine[];
  total: number;
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

export async function createOrder(body: Record<string, unknown>): Promise<Order> {
  const { products } = await getStoreData();

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
  if (!/^\d{6}$/.test(pincode)) throw new OrderError("Please enter a valid 6-digit PIN code.");

  const raw = Array.isArray(body.items) ? (body.items as InLine[]).slice(0, 20) : [];
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
  if (!lines.length) throw new OrderError("Your cart is empty or out of date. Please add the mattress again.");

  const d = new Date();
  const id = `GD-${d.toISOString().slice(2, 10).replace(/-/g, "")}-${randomBytes(2).toString("hex").toUpperCase()}`;

  const order: Order = {
    id,
    createdAt: d.toISOString(),
    status: "new",
    customer: { name, phone, email: email || undefined, address, city, pincode },
    payment,
    notes: notes || undefined,
    lines,
    total: lines.reduce((sum, l) => sum + l.lineTotal, 0),
  };

  await fs.mkdir(dataDir(), { recursive: true });
  await fs.appendFile(file(), JSON.stringify(order) + "\n", "utf-8");
  return order;
}

export async function listOrders(): Promise<Order[]> {
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
