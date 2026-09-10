import { promises as fs } from "fs";
import path from "path";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "crypto";
import { dataDir } from "@/lib/store";

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

  const db = await readDb();

  if (db.customers.some((customer) => customer.email === email)) {
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

  db.customers.push(record);
  await writeDb(db);

  return publicCustomer(record);
}

export async function authenticateCustomer(
  emailInput: string,
  password: string
) {
  const email = normalizeEmail(emailInput);
  const db = await readDb();

  const record = db.customers.find(
    (customer) => customer.email === email
  );

  if (!record || !verifyPassword(password, record.passwordHash)) {
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

    const db = await readDb();

    const record = db.customers.find(
      (customer) =>
        customer.id === decoded.id &&
        customer.email === decoded.email
    );

    return record ? publicCustomer(record) : null;
  } catch {
    return null;
  }
}

export const CUSTOMER_COOKIE = "eurofoam_customer";
