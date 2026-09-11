import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { dataDir, ensureStore } from "@/lib/store";

type AdminRecord = {
  username: string;
  salt: string;
  passwordHash: string;
  updatedAt: string;
};

const COOKIE_NAME = "eurofoam_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function adminPath() {
  return path.join(dataDir(), "admin.json");
}

function sessionSecret() {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (configured && configured.length >= 24) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET is required in production and must be at least 24 characters."
    );
  }

  return "eurofoam-local-development-session-secret";
}

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export async function hasAdminAccount() {
  await ensureStore();
  try {
    await fs.access(adminPath());
    return true;
  } catch {
    return false;
  }
}

export async function createFirstAdmin(username: string, password: string) {
  await ensureStore();

  if (await hasAdminAccount()) {
    throw new Error("Admin account already exists.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const record: AdminRecord = {
    username,
    salt,
    passwordHash: hashPassword(password, salt),
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(adminPath(), JSON.stringify(record, null, 2), {
    encoding: "utf-8",
    flag: "wx"
  });
}

async function readAdmin(): Promise<AdminRecord | null> {
  if (!(await hasAdminAccount())) return null;
  try {
    return JSON.parse(await fs.readFile(adminPath(), "utf-8")) as AdminRecord;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(username: string, password: string) {
  const admin = await readAdmin();
  if (!admin) return false;

  const expectedUsername = Buffer.from(admin.username);
  const suppliedUsername = Buffer.from(username);

  const usernameOk =
    expectedUsername.length === suppliedUsername.length &&
    crypto.timingSafeEqual(expectedUsername, suppliedUsername);

  const expectedHash = Buffer.from(admin.passwordHash, "hex");
  const suppliedHash = Buffer.from(hashPassword(password, admin.salt), "hex");

  const passwordOk =
    expectedHash.length === suppliedHash.length &&
    crypto.timingSafeEqual(expectedHash, suppliedHash);

  return usernameOk && passwordOk;
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
}

export function createSessionToken(username: string) {
  const body = Buffer.from(
    JSON.stringify({
      username,
      expiresAt: Date.now() + MAX_AGE_SECONDS * 1000
    })
  ).toString("base64url");

  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8")
    ) as { username: string; expiresAt: number };

    return Boolean(parsed.username) && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE_NAME)?.value);
}

export const adminCookie = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS
};

export async function updateAdminAccount({
  currentPassword,
  username,
  newPassword
}: {
  currentPassword: string;
  username: string;
  newPassword?: string;
}) {
  const admin = await readAdmin();
  if (!admin) throw new Error("Admin account not found.");

  if (!(await verifyAdminCredentials(admin.username, currentPassword))) {
    throw new Error("Current password is incorrect.");
  }

  const passwordToStore = newPassword?.trim() ? newPassword : null;
  const salt = passwordToStore
    ? crypto.randomBytes(16).toString("hex")
    : admin.salt;

  const updated: AdminRecord = {
    username,
    salt,
    passwordHash: passwordToStore
      ? hashPassword(passwordToStore, salt)
      : admin.passwordHash,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(adminPath(), JSON.stringify(updated, null, 2), "utf-8");
}

export async function currentAdminUsername() {
  return (await readAdmin())?.username || "";
}
