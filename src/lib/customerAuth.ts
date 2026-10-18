import { promises as fs } from "fs";
import path from "path";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "crypto";
import { dataDir } from "@/lib/store";
import { db as pg, hasDb } from "@/lib/db";

export type Customer = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
};

type CustomerRecord = Customer & {
  passwordHash: string;
};

type CustomerDatabase = {
  customers: CustomerRecord[];
};

function dbPath() {
  return path.join(dataDir(), "customers.json");
}

async function readDb(): Promise<CustomerDatabase> {
  await fs.mkdir(dataDir(), { recursive: true });

  try {
    return JSON.parse(
      await fs.readFile(dbPath(), "utf-8")
    ) as CustomerDatabase;
  } catch {
    return { customers: [] };
  }
}

async function writeDb(db: CustomerDatabase) {
  const target = dbPath();
  const temp = `${target}.tmp`;

  await fs.writeFile(temp, JSON.stringify(db, null, 2), "utf-8");
  await fs.rename(temp, target);
}

/* ---------- storage: Postgres (gadda.customers) or data/customers.json ---------- */

type Row = { id: string; name: string; email: string; mobile: string; password_hash: string; created_at: Date };
const fromRow = (r: Row): CustomerRecord => ({
  id: r.id,
  name: r.name,
  email: r.email,
  mobile: r.mobile,
  passwordHash: r.password_hash,
  createdAt: new Date(r.created_at).toISOString()
});

async function findByEmail(email: string): Promise<CustomerRecord | undefined> {
  if (hasDb()) {
    const { rows } = await (await pg()).query("select * from gadda.customers where email = $1", [email]);
    return rows[0] ? fromRow(rows[0]) : undefined;
  }
  return (await readDb()).customers.find((c) => c.email === email);
}

async function findById(id: string, email: string): Promise<CustomerRecord | undefined> {
  if (hasDb()) {
    const { rows } = await (await pg()).query("select * from gadda.customers where id = $1 and email = $2", [id, email]);
    return rows[0] ? fromRow(rows[0]) : undefined;
  }
  return (await readDb()).customers.find((c) => c.id === id && c.email === email);
}

async function insertCustomer(record: CustomerRecord) {
  if (hasDb()) {
    try {
      await (await pg()).query(
        `insert into gadda.customers (id, name, email, mobile, password_hash, created_at)
         values ($1, $2, $3, $4, $5, $6)`,
        [record.id, record.name, record.email, record.mobile, record.passwordHash, record.createdAt]
      );
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new Error("An account already exists with this email.");
      throw e;
    }
    return;
  }
  const file = await readDb();
  file.customers.push(record);
  await writeDb(file);
}

/* For the one-time import of data/customers.json into Postgres. */
export async function readCustomerFile() {
  return (await readDb()).customers;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");

  if (!salt || !expectedHex) return false;

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");

  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
}

const DUMMY_HASH = hashPassword(randomBytes(12).toString("hex"));

function publicCustomer(record: CustomerRecord): Customer {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    mobile: record.mobile,
    createdAt: record.createdAt
  };
}

export async function registerCustomer(input: {
  name: string;
  email: string;
  mobile?: string;
  password: string;
}) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const mobile = (input.mobile || "").replace(/[^\d+]/g, "");
  const password = input.password;

  if (name.length < 2) {
    throw new Error("Enter your name.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  if (password.length > 200) {
    throw new Error("Password is too long.");
  }

  if (await findByEmail(email)) {
    throw new Error("An account already exists with this email.");
  }

  const record: CustomerRecord = {
    id: `customer-${Date.now()}-${randomBytes(4).toString("hex")}`,
    name,
    email,
    mobile,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password)
  };

  await insertCustomer(record);

  return publicCustomer(record);
}

export async function authenticateCustomer(
  emailInput: string,
  password: string
) {
  const email = normalizeEmail(emailInput);
  const record = await findByEmail(email);

  // Always run scrypt, even for unknown emails, so response time
  // doesn't reveal which emails have accounts.
  const ok = verifyPassword(
    password.slice(0, 200),
    record?.passwordHash || DUMMY_HASH
  );

  if (!record || !ok) {
    throw new Error("Incorrect email or password.");
  }

  return publicCustomer(record);
}

function sessionSecret() {
  const secret = process.env.CUSTOMER_SESSION_SECRET;

  if (!secret) {
    throw new Error("CUSTOMER_SESSION_SECRET is missing.");
  }

  return secret;
}

export function createCustomerSession(customer: Customer) {
  const payload = Buffer.from(
    JSON.stringify({
      id: customer.id,
      email: customer.email,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30
    })
  ).toString("base64url");

  const signature = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export async function customerFromSession(token?: string) {
  if (!token) return null;

  try {
    const [payload, signature] = token.split(".");

    if (!payload || !signature) return null;

    const expected = createHmac("sha256", sessionSecret())
      .update(payload)
      .digest();

    const received = Buffer.from(signature, "base64url");

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as {
      id: string;
      email: string;
      exp: number;
    };

    if (!decoded.exp || decoded.exp < Date.now()) return null;

    const record = await findById(decoded.id, decoded.email);

    return record ? publicCustomer(record) : null;
  } catch {
    return null;
  }
}

export const CUSTOMER_COOKIE = "eurofoam_customer";

/* DPDP right to erasure: removes the account. Orders are kept (GST law
   requires invoices for 8 years) but are no longer linked to a login. */
export async function deleteCustomer(id: string) {
  if (hasDb()) {
    const res = await (await pg()).query("delete from gadda.customers where id = $1", [id]);
    return (res as { rowCount?: number }).rowCount === 1;
  }
  const db = await readDb();
  const before = db.customers.length;
  db.customers = db.customers.filter((c) => c.id !== id);
  if (db.customers.length !== before) await writeDb(db);
  return before !== db.customers.length;
}
