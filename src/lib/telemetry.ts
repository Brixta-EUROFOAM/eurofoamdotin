import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { dataDir } from "@/lib/store";

export type TelemetryEvent = {
  id: string;
  timestamp: string;
  type: string;
  visitorId: string;
  sessionId: string;
  customerId?: string;
  path: string;
  title?: string;
  productSlug?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device?: string;
  viewportWidth?: number;
  language?: string;
  depth?: number;
  durationSeconds?: number;
  value?: number;
  quantity?: number;
  itemCount?: number;
};

function filePath() {
  return path.join(dataDir(), "telemetry.jsonl");
}

function text(value: unknown, max = 300) {
  return String(value || "")
    .slice(0, max)
    .replace(/[\r\n]/g, " ");
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function appendTelemetry(input: any) {
  await fs.mkdir(dataDir(), { recursive: true });

  const event: TelemetryEvent = {
    id: `event-${Date.now()}-${randomBytes(4).toString("hex")}`,
    timestamp: new Date().toISOString(),

    type: text(input.type, 60),
    visitorId: text(input.visitorId, 140),
    sessionId: text(input.sessionId, 140),

    customerId: input.customerId
      ? text(input.customerId, 140)
      : undefined,

    path: text(input.path || "/", 500),
    title: input.title ? text(input.title) : undefined,

    productSlug: input.productSlug
      ? text(input.productSlug, 160)
      : undefined,

    referrer: input.referrer
      ? text(input.referrer)
      : undefined,

    utmSource: input.utmSource
      ? text(input.utmSource, 120)
      : undefined,

    utmMedium: input.utmMedium
      ? text(input.utmMedium, 120)
      : undefined,

    utmCampaign: input.utmCampaign
      ? text(input.utmCampaign, 160)
      : undefined,

    device: input.device
      ? text(input.device, 30)
      : undefined,

    language: input.language
      ? text(input.language, 40)
      : undefined,

    viewportWidth: number(input.viewportWidth),
    depth: number(input.depth),
    durationSeconds: number(input.durationSeconds),
    value: number(input.value),
    quantity: number(input.quantity),
    itemCount: number(input.itemCount)
  };

  await fs.appendFile(
    filePath(),
    JSON.stringify(event) + "\n",
    "utf-8"
  );

  return event;
}

export async function readTelemetry(days = 30) {
  try {
    const raw = await fs.readFile(filePath(), "utf-8");

    const cutoff =
      Date.now() - days * 24 * 60 * 60 * 1000;

    return raw
      .trim()
      .split("\n")
      .slice(-100000)
      .map((line) => {
        try {
          return JSON.parse(line) as TelemetryEvent;
        } catch {
          return null;
        }
      })
      .filter(
        (event): event is TelemetryEvent =>
          Boolean(
            event &&
            new Date(event.timestamp).getTime() >= cutoff
          )
      );
  } catch {
    return [];
  }
}

function ranking(values: string[]) {
  const map = new Map<string, number>();

  for (const value of values) {
    if (!value) continue;
    map.set(value, (map.get(value) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function analyticsSummary(days = 30) {
  const events = await readTelemetry(days);

  const pageViews = events.filter(
    (event) => event.type === "page_view"
  );

  const productViews = events.filter(
    (event) => event.type === "product_view"
  );

  const addToCart = events.filter(
    (event) => event.type === "add_to_cart"
  );

  const checkoutStarts = events.filter(
    (event) => event.type === "checkout_start"
  );

  const visitors = new Set(
    pageViews.map((event) => event.visitorId).filter(Boolean)
  );

  const sessions = new Set(
    pageViews.map((event) => event.sessionId).filter(Boolean)
  );

  const signedIn = new Set(
    pageViews
      .filter((event) => Boolean(event.customerId))
      .map((event) => event.visitorId)
  );

  const engagement = events.filter(
    (event) => event.type === "page_engagement"
  );

  const engagementSeconds = engagement.reduce(
    (sum, event) => sum + (event.durationSeconds || 0),
    0
  );

  const daily = new Map<
    string,
    {
      date: string;
      pageViews: number;
      visitors: Set<string>;
    }
  >();

  for (const event of pageViews) {
    const date = event.timestamp.slice(0, 10);

    if (!daily.has(date)) {
      daily.set(date, {
        date,
        pageViews: 0,
        visitors: new Set()
      });
    }

    const row = daily.get(date)!;

    row.pageViews += 1;
    row.visitors.add(event.visitorId);
  }

  return {
    totalPageViews: pageViews.length,
    uniqueVisitors: visitors.size,
    sessions: sessions.size,

    accountVisitors: signedIn.size,
    guestVisitors: Math.max(
      visitors.size - signedIn.size,
      0
    ),

    productViews: productViews.length,
    addToCart: addToCart.length,
    checkoutStarts: checkoutStarts.length,

    averageEngagementSeconds: engagement.length
      ? Math.round(engagementSeconds / engagement.length)
      : 0,

    topPages: ranking(
      pageViews.map((event) => event.path)
    ).slice(0, 12),

    topProducts: ranking(
      productViews.map((event) => event.productSlug || "")
    ).slice(0, 12),

    referrers: ranking(
      pageViews.map(
        (event) => event.referrer || "Direct / none"
      )
    ).slice(0, 10),

    devices: ranking(
      pageViews.map(
        (event) => event.device || "unknown"
      )
    ),

    campaigns: ranking(
      pageViews.map(
        (event) => event.utmCampaign || ""
      )
    ).slice(0, 10),

    daily: Array.from(daily.values())
      .map((row) => ({
        date: row.date,
        pageViews: row.pageViews,
        visitors: row.visitors.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  };
}
