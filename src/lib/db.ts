import { Pool, type PoolClient } from "pg";

/*
  Direct connection to your self-hosted Supabase Postgres — the same setup
  as NAMS Venture. Everything lives in its own schema, "gadda", which
  Supabase's public REST/GraphQL API does NOT expose: only this server
  can read or write it (row-level security is on with no policies).

  The schema and every table are created automatically when the server
  starts (src/instrumentation.ts), and existing data/ files from the old
  file-based storage are imported once on that first start.

  Env:
    DATABASE_URL  postgresql://USER:PASSWORD@HOST:5432/postgres
    DATABASE_SSL  "true" if your Postgres requires SSL (self-host usually doesn't)

  Without DATABASE_URL the site falls back to files in data/ (handy for
  local development).
*/

export const SCHEMA = "gadda";

export const SCHEMA_SQL = `
create schema if not exists gadda;

-- One row: site settings, products, reviews (edited in /admin)
create table if not exists gadda.store (
  id          int primary key default 1 check (id = 1),
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists gadda.admins (
  id             text primary key,
  username       text not null unique,
  salt           text not null,
  password_hash  text not null,
  role           text not null default 'admin' check (role in ('owner', 'admin')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists gadda.customers (
  id             text primary key,
  name           text not null,
  email          text not null unique,
  mobile         text not null default '',
  password_hash  text not null,
  created_at     timestamptz not null default now()
);

create table if not exists gadda.orders (
  id               text primary key,
  created_at       timestamptz not null default now(),
  status           text not null default 'new',
  customer_id      text,
  phone            text not null,
  pincode          text not null,
  total            integer not null,
  idempotency_key  text unique,
  data             jsonb not null
);
create index if not exists orders_created_idx  on gadda.orders (created_at desc);
create index if not exists orders_customer_idx on gadda.orders (customer_id);
create index if not exists orders_phone_idx    on gadda.orders (phone);

create table if not exists gadda.events (
  id            bigserial primary key,
  ts            timestamptz not null default now(),
  type          text not null,
  visitor_id    text,
  session_id    text,
  customer_id   text,
  path          text,
  product_slug  text,
  data          jsonb not null
);
create index if not exists events_ts_idx      on gadda.events (ts);
create index if not exists events_type_ts_idx on gadda.events (type, ts);

create table if not exists gadda.consent_receipts (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  receipt_id  text not null,
  version     int not null,
  analytics   boolean not null,
  marketing   boolean not null,
  source      text not null
);
create index if not exists consent_at_idx on gadda.consent_receipts (at);

create table if not exists gadda.subscribers (
  id       bigserial primary key,
  at       timestamptz not null default now(),
  email    text not null,
  consent  text not null
);
create index if not exists subscribers_email_idx on gadda.subscribers (email);

create table if not exists gadda.callbacks (
  id       bigserial primary key,
  at       timestamptz not null default now(),
  name     text not null,
  phone    text not null,
  "when"   text,
  message  text,
  status   text not null default 'new'
);
create index if not exists callbacks_at_idx on gadda.callbacks (at);

create table if not exists gadda.media (
  filename    text primary key,
  mime        text not null,
  bytes       bytea not null,
  created_at  timestamptz not null default now()
);

create table if not exists gadda.meta (
  key    text primary key,
  value  text not null,
  at     timestamptz not null default now()
);

alter table gadda.store            enable row level security;
alter table gadda.admins           enable row level security;
alter table gadda.customers        enable row level security;
alter table gadda.orders           enable row level security;
alter table gadda.events           enable row level security;
alter table gadda.consent_receipts enable row level security;
alter table gadda.subscribers      enable row level security;
alter table gadda.callbacks        enable row level security;
alter table gadda.media            enable row level security;
alter table gadda.meta             enable row level security;
`;

type G = { _gaddaPool?: Pool; _gaddaReady?: Promise<void> };
const g = globalThis as unknown as G;

export function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

function pool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!g._gaddaPool) {
    g._gaddaPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 8,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
    g._gaddaPool.on("error", (e) => console.error("[db] idle client error", e.message));
  }
  return g._gaddaPool;
}

/* Ready-to-use pool; creates the schema + tables the first time. */
export async function db(): Promise<Pool> {
  const p = pool();
  if (!g._gaddaReady) {
    g._gaddaReady = p
      .query(SCHEMA_SQL)
      .then(() => undefined)
      .catch((e) => {
        g._gaddaReady = undefined;
        throw e;
      });
  }
  await g._gaddaReady;
  return p;
}

/* Run several statements atomically. */
export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await (await db()).connect();
  try {
    await client.query("begin");
    const out = await fn(client);
    await client.query("commit");
    return out;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
