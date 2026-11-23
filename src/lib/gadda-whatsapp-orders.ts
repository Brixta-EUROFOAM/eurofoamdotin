import { db, hasDb } from "@/lib/db";
import type { Order } from "@/lib/orders";
import { whatsappConfigured, whatsappHash, whatsappStopped, sendWhatsAppTemplate, type WaMessageKind } from "@/lib/gadda-whatsapp";

/**
 * Customer-requested WhatsApp order notifications, not marketing.
 * At-most-one send attempt per unique business event by default; uncertain outcomes are
 * retained for manual review to avoid sending duplicates after a network timeout.
 */
export type WaOrderEvent = "received" | "status" | "paid";
export async function notifyOrderWhatsApp(order: Order, event: WaOrderEvent) {
  if (!hasDb() || !whatsappConfigured() || !order.whatsappUpdates || !order.phoneVerifiedAt) return;
  const phone = order.customer.phone;
  if (await whatsappStopped(phone)) return;
  const latestMovement = [...(order.history || [])].reverse().find(h => h.event === "moved" || h.event === "cancelled");
  const unique = event === "status" ? `${event}:${order.id}:${order.status}:${latestMovement?.at || ""}` : `${event}:${order.id}`;
  const key = `wa:outbox:${whatsappHash(unique)}`;
  const kind: WaMessageKind = event;
  const name = order.customer.name.replace(/[\r\n]/g, " ").trim().slice(0, 45) || "Customer";
  const orderNumber = order.id;
  const amount = String(order.total);
  const status = order.status === "dispatched" ? "on its way" : order.status === "delivered" ? "delivered" : order.status === "cancelled" ? "cancelled" : order.status.replace(/[_-]/g," ").slice(0, 70);
  // These values match the approved three-variable utility templates in the setup guide.
  const fields = event === "received" ? [name, orderNumber, amount]
    : event === "paid" ? [name, orderNumber, amount] : [name, orderNumber, status];
  const initial = JSON.stringify({ state: "pending", event, orderId: orderNumber, createdAt: new Date().toISOString() });
  try {
    const pool = await db();
    const inserted = await pool.query("insert into gadda.meta (key,value,at) values ($1,$2,now()) on conflict (key) do nothing returning key", [key, initial]);
    if (!inserted.rowCount) return; // Already attempted: no duplicate orders/notifications on webhook retries.
    const sending = JSON.stringify({ state: "sending", event, orderId: orderNumber, createdAt: new Date().toISOString() });
    const claimed = await pool.query("update gadda.meta set value=$3,at=now() where key=$1 and value=$2 returning key", [key, initial, sending]);
    if (!claimed.rowCount) return;
    try {
      const message = await sendWhatsAppTemplate(kind, phone, fields);
      const accepted = JSON.stringify({ state: "accepted", event, orderId: orderNumber, messageId: message.id, at: new Date().toISOString() });
      await pool.query("update gadda.meta set value=$3,at=now() where key=$1 and value=$2", [key, sending, accepted]);
    } catch (error) {
      const uncertain = JSON.stringify({ state: "uncertain", event, orderId: orderNumber, at: new Date().toISOString() });
      await pool.query("update gadda.meta set value=$3,at=now() where key=$1 and value=$2", [key, sending, uncertain]).catch(() => {});
      console.error("[gadda whatsapp] Order notification outcome uncertain", event, orderNumber, (error as Error).message);
    }
  } catch (error) {
    // WhatsApp must NEVER invalidate a real order, payment or logistics stage change.
    console.error("[gadda whatsapp] Unable to enqueue order update", event, orderNumber, (error as Error).name);
  }
}
