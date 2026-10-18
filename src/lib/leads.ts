import { promises as fs } from "fs";
import path from "path";
import { dataDir, mediaDir } from "@/lib/store";
import { db, hasDb } from "@/lib/db";

/*
  Call-backs, newsletter sign-ups, consent receipts and uploaded images.
  - With DATABASE_URL: gadda.callbacks / subscribers / consent_receipts / media.
  - Without: data/*.jsonl and data/media/ (local development).
*/

export const LEAD_FILES = {
  callbacks: "callbacks.jsonl",
  subscribers: "subscribers.jsonl",
  consent: "consent.jsonl",
} as const;
export type LeadType = keyof typeof LEAD_FILES;

export type Callback = { at: string; name: string; phone: string; when?: string; message?: string };
export type Subscriber = { at: string; email: string; consent: string };
export type ConsentReceipt = { id: string; v: number; analytics: boolean; marketing: boolean; source: string; at: string };

async function appendLine(file: string, row: unknown) {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.appendFile(path.join(dataDir(), file), JSON.stringify(row) + "\n", "utf-8");
}

export async function readLeadFile(type: LeadType): Promise<Record<string, unknown>[]> {
  try {
    return (await fs.readFile(path.join(dataDir(), LEAD_FILES[type]), "utf-8"))
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
  } catch {
    return [];
  }
}

export async function addCallback(c: Callback) {
  if (!hasDb()) return appendLine(LEAD_FILES.callbacks, c);
  await (await db()).query(
    `insert into gadda.callbacks (at, name, phone, "when", message) values ($1, $2, $3, $4, $5)`,
    [c.at, c.name, c.phone, c.when || null, c.message || null]
  );
}

export async function addSubscriber(s: Subscriber) {
  if (!hasDb()) return appendLine(LEAD_FILES.subscribers, s);
  await (await db()).query("insert into gadda.subscribers (at, email, consent) values ($1, $2, $3)", [
    s.at,
    s.email,
    s.consent,
  ]);
}

export async function addConsent(r: ConsentReceipt) {
  if (!hasDb()) return appendLine(LEAD_FILES.consent, r);
  await (await db()).query(
    `insert into gadda.consent_receipts (at, receipt_id, version, analytics, marketing, source)
     values ($1, $2, $3, $4, $5, $6)`,
    [r.at, r.id, r.v, r.analytics, r.marketing, r.source]
  );
}

/* Rows for the admin CSV export, oldest first, same columns as the old files. */
export async function readLeads(type: LeadType): Promise<Record<string, unknown>[]> {
  if (!hasDb()) return readLeadFile(type);
  const q = {
    callbacks: `select to_char(at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as at, name, phone, "when", message, status
                from gadda.callbacks order by at`,
    subscribers: `select to_char(at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as at, email, consent
                  from gadda.subscribers order by at`,
    consent: `select receipt_id as id, version as v, analytics, marketing, source,
                     to_char(at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as at
              from gadda.consent_receipts order by at`,
  }[type];
  return (await (await db()).query(q)).rows;
}

/* ---------- media ---------- */

export async function saveMedia(filename: string, mime: string, bytes: Buffer) {
  if (!hasDb()) {
    await fs.mkdir(mediaDir(), { recursive: true });
    await fs.writeFile(path.join(mediaDir(), filename), bytes);
    return;
  }
  await (await db()).query(
    `insert into gadda.media (filename, mime, bytes) values ($1, $2, $3)
     on conflict (filename) do update set mime = excluded.mime, bytes = excluded.bytes`,
    [filename, mime, bytes]
  );
}

export async function readMedia(filename: string): Promise<{ mime?: string; bytes: Buffer } | null> {
  if (hasDb()) {
    const { rows } = await (await db()).query("select mime, bytes from gadda.media where filename = $1", [filename]);
    if (rows[0]) return { mime: rows[0].mime, bytes: rows[0].bytes };
  }
  /* files shipped with/left in data/media still work (and are the dev store) */
  try {
    return { bytes: await fs.readFile(path.join(mediaDir(), filename)) };
  } catch {
    return null;
  }
}
