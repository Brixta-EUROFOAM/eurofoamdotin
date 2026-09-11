import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";

import {
  dataDir,
  ensureStore
} from "@/lib/store";


export type AdminRole =
  | "owner"
  | "admin";


type AdminRecord = {
  id: string;
  username: string;

  salt: string;
  passwordHash: string;

  role: AdminRole;

  createdAt: string;
  updatedAt: string;
};


type AdminFile = {
  version: 2;
  admins: AdminRecord[];
};


type LegacyAdminRecord = {
  username: string;
  salt: string;
  passwordHash: string;
  updatedAt?: string;
};


export type AdminSummary = {
  id: string;
  username: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
};


const COOKIE_NAME =
  "eurofoam_admin_session";

const MAX_AGE_SECONDS =
  60 * 60 * 12;


function adminPath() {
  return path.join(
    dataDir(),
    "admin.json"
  );
}


function sessionSecret() {
  const configured =
    process.env.ADMIN_SESSION_SECRET;

  if (
    configured &&
    configured.length >= 24
  ) {
    return configured;
  }

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    throw new Error(
      "ADMIN_SESSION_SECRET is required in production and must be at least 24 characters."
    );
  }

  return (
    "eurofoam-local-development-session-secret"
  );
}


function hashPassword(
  password: string,
  salt: string
) {
  return crypto
    .scryptSync(
      password,
      salt,
      64
    )
    .toString("hex");
}


function makeId() {
  return crypto
    .randomBytes(16)
    .toString("hex");
}


function legacyId(
  username: string
) {
  return (
    "legacy-" +
    crypto
      .createHash("sha256")
      .update(username)
      .digest("hex")
      .slice(0, 16)
  );
}


function sameUsername(
  first: string,
  second: string
) {
  return (
    first.trim().toLowerCase() ===
    second.trim().toLowerCase()
  );
}


function normalizeAdminFile(
  raw: unknown
): AdminFile {
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray(
      (raw as AdminFile).admins
    )
  ) {
    const file =
      raw as AdminFile;

    return {
      version: 2,
      admins:
        file.admins.filter(
          (admin) =>
            Boolean(
              admin?.username &&
              admin?.salt &&
              admin?.passwordHash
            )
        )
    };
  }

  /*
   * AUTOMATIC LEGACY MIGRATION
   *
   * Your original admin.json looked like:
   *
   * {
   *   username,
   *   salt,
   *   passwordHash,
   *   updatedAt
   * }
   *
   * We transparently interpret that user
   * as the first Super Admin.
   */
  if (
    raw &&
    typeof raw === "object"
  ) {
    const legacy =
      raw as LegacyAdminRecord;

    if (
      legacy.username &&
      legacy.salt &&
      legacy.passwordHash
    ) {
      const date =
        legacy.updatedAt ||
        new Date().toISOString();

      return {
        version: 2,
        admins: [
          {
            id: legacyId(
              legacy.username
            ),
            username:
              legacy.username,
            salt:
              legacy.salt,
            passwordHash:
              legacy.passwordHash,
            role: "owner",
            createdAt: date,
            updatedAt: date
          }
        ]
      };
    }
  }

  return {
    version: 2,
    admins: []
  };
}


async function readAdminFile():
  Promise<AdminFile> {
  await ensureStore();

  try {
    const raw =
      JSON.parse(
        await fs.readFile(
          adminPath(),
          "utf-8"
        )
      );

    return normalizeAdminFile(
      raw
    );
  } catch {
    return {
      version: 2,
      admins: []
    };
  }
}


async function writeAdminFile(
  state: AdminFile
) {
  await ensureStore();

  const destination =
    adminPath();

  const temporary =
    `${destination}.tmp`;

  await fs.writeFile(
    temporary,
    JSON.stringify(
      state,
      null,
      2
    ),
    "utf-8"
  );

  await fs.rename(
    temporary,
    destination
  );
}


function publicAdmin(
  admin: AdminRecord
): AdminSummary {
  return {
    id: admin.id,
    username:
      admin.username,
    role:
      admin.role,
    createdAt:
      admin.createdAt,
    updatedAt:
      admin.updatedAt
  };
}


export async function hasAdminAccount() {
  const state =
    await readAdminFile();

  return (
    state.admins.length > 0
  );
}


export async function createFirstAdmin(
  username: string,
  password: string
) {
  const state =
    await readAdminFile();

  if (
    state.admins.length > 0
  ) {
    throw new Error(
      "Admin account already exists."
    );
  }

  const cleanUsername =
    username.trim();

  if (
    cleanUsername.length < 3
  ) {
    throw new Error(
      "Username must be at least 3 characters."
    );
  }

  if (
    password.length < 10
  ) {
    throw new Error(
      "Password must be at least 10 characters."
    );
  }

  const now =
    new Date().toISOString();

  const salt =
    crypto
      .randomBytes(16)
      .toString("hex");

  const record: AdminRecord = {
    id: makeId(),
    username:
      cleanUsername,

    salt,
    passwordHash:
      hashPassword(
        password,
        salt
      ),

    /*
     * FIRST ADMIN IS ALWAYS
     * THE SUPER ADMIN.
     */
    role: "owner",

    createdAt: now,
    updatedAt: now
  };

  await writeAdminFile({
    version: 2,
    admins: [
      record
    ]
  });
}


export async function verifyAdminCredentials(
  username: string,
  password: string
) {
  const state =
    await readAdminFile();

  const admin =
    state.admins.find(
      (candidate) =>
        sameUsername(
          candidate.username,
          username
        )
    );

  if (!admin) {
    return false;
  }

  const expectedHash =
    Buffer.from(
      admin.passwordHash,
      "hex"
    );

  const suppliedHash =
    Buffer.from(
      hashPassword(
        password,
        admin.salt
      ),
      "hex"
    );

  return (
    expectedHash.length ===
      suppliedHash.length &&
    crypto.timingSafeEqual(
      expectedHash,
      suppliedHash
    )
  );
}


function sign(
  payload: string
) {
  return crypto
    .createHmac(
      "sha256",
      sessionSecret()
    )
    .update(payload)
    .digest("base64url");
}


export function createSessionToken(
  username: string
) {
  const body =
    Buffer.from(
      JSON.stringify({
        username,
        expiresAt:
          Date.now() +
          MAX_AGE_SECONDS *
            1000
      })
    ).toString(
      "base64url"
    );

  return (
    `${body}.${sign(body)}`
  );
}


function parseSessionToken(
  token?: string
):
  | {
      username: string;
      expiresAt: number;
    }
  | null {
  if (!token) {
    return null;
  }

  const [
    body,
    signature
  ] =
    token.split(".");

  if (
    !body ||
    !signature
  ) {
    return null;
  }

  const expected =
    sign(body);

  const supplied =
    Buffer.from(
      signature
    );

  const calculated =
    Buffer.from(
      expected
    );

  if (
    supplied.length !==
      calculated.length ||
    !crypto.timingSafeEqual(
      supplied,
      calculated
    )
  ) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        Buffer.from(
          body,
          "base64url"
        ).toString(
          "utf-8"
        )
      ) as {
        username: string;
        expiresAt: number;
      };

    if (
      !parsed.username ||
      parsed.expiresAt <=
        Date.now()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}


export function verifySessionToken(
  token?: string
) {
  return Boolean(
    parseSessionToken(
      token
    )
  );
}


async function sessionAdmin():
  Promise<AdminRecord | null> {
  const jar =
    await cookies();

  const session =
    parseSessionToken(
      jar.get(
        COOKIE_NAME
      )?.value
    );

  if (!session) {
    return null;
  }

  const state =
    await readAdminFile();

  return (
    state.admins.find(
      (admin) =>
        sameUsername(
          admin.username,
          session.username
        )
    ) ||
    null
  );
}


export async function isAdminAuthenticated() {
  return Boolean(
    await sessionAdmin()
  );
}


export async function currentAdminUsername() {
  return (
    (
      await sessionAdmin()
    )?.username ||
    ""
  );
}


export async function currentAdminRole():
  Promise<AdminRole | null> {
  return (
    (
      await sessionAdmin()
    )?.role ||
    null
  );
}


export async function listAdminAccounts():
  Promise<AdminSummary[]> {
  const state =
    await readAdminFile();

  return state.admins
    .map(publicAdmin)
    .sort(
      (a, b) => {
        if (
          a.role !== b.role
        ) {
          return (
            a.role ===
            "owner"
              ? -1
              : 1
          );
        }

        return (
          a.username.localeCompare(
            b.username
          )
        );
      }
    );
}


export async function createAdminAccount({
  username,
  password,
  role = "admin"
}: {
  username: string;
  password: string;
  role?: AdminRole;
}) {
  const cleanUsername =
    username.trim();

  if (
    cleanUsername.length < 3
  ) {
    throw new Error(
      "Username must be at least 3 characters."
    );
  }

  if (
    password.length < 10
  ) {
    throw new Error(
      "Password must be at least 10 characters."
    );
  }

  if (
    role !== "owner" &&
    role !== "admin"
  ) {
    throw new Error(
      "Invalid admin role."
    );
  }

  const state =
    await readAdminFile();

  if (
    state.admins.some(
      (admin) =>
        sameUsername(
          admin.username,
          cleanUsername
        )
    )
  ) {
    throw new Error(
      "That username already exists."
    );
  }

  const salt =
    crypto
      .randomBytes(16)
      .toString("hex");

  const now =
    new Date().toISOString();

  state.admins.push({
    id: makeId(),
    username:
      cleanUsername,

    salt,
    passwordHash:
      hashPassword(
        password,
        salt
      ),

    role,

    createdAt: now,
    updatedAt: now
  });

  await writeAdminFile(
    state
  );
}


export async function deleteAdminAccount(
  username: string
) {
  const state =
    await readAdminFile();

  const target =
    state.admins.find(
      (admin) =>
        sameUsername(
          admin.username,
          username
        )
    );

  if (!target) {
    throw new Error(
      "Admin account not found."
    );
  }

  if (
    state.admins.length <= 1
  ) {
    throw new Error(
      "You cannot delete the only admin account."
    );
  }

  if (
    target.role === "owner"
  ) {
    const owners =
      state.admins.filter(
        (admin) =>
          admin.role ===
          "owner"
      );

    if (
      owners.length <= 1
    ) {
      throw new Error(
        "You cannot delete the last Super Admin."
      );
    }
  }

  state.admins =
    state.admins.filter(
      (admin) =>
        !sameUsername(
          admin.username,
          username
        )
    );

  await writeAdminFile(
    state
  );
}


export async function setAdminRole(
  username: string,
  role: AdminRole
) {
  if (
    role !== "owner" &&
    role !== "admin"
  ) {
    throw new Error(
      "Invalid role."
    );
  }

  const state =
    await readAdminFile();

  const target =
    state.admins.find(
      (admin) =>
        sameUsername(
          admin.username,
          username
        )
    );

  if (!target) {
    throw new Error(
      "Admin account not found."
    );
  }

  if (
    target.role ===
      "owner" &&
    role ===
      "admin"
  ) {
    const owners =
      state.admins.filter(
        (admin) =>
          admin.role ===
          "owner"
      );

    if (
      owners.length <= 1
    ) {
      throw new Error(
        "At least one Super Admin must remain."
      );
    }
  }

  target.role = role;
  target.updatedAt =
    new Date().toISOString();

  await writeAdminFile(
    state
  );
}


export async function resetAdminPassword(
  username: string,
  newPassword: string
) {
  if (
    newPassword.length < 10
  ) {
    throw new Error(
      "Password must be at least 10 characters."
    );
  }

  const state =
    await readAdminFile();

  const target =
    state.admins.find(
      (admin) =>
        sameUsername(
          admin.username,
          username
        )
    );

  if (!target) {
    throw new Error(
      "Admin account not found."
    );
  }

  const salt =
    crypto
      .randomBytes(16)
      .toString("hex");

  target.salt = salt;

  target.passwordHash =
    hashPassword(
      newPassword,
      salt
    );

  target.updatedAt =
    new Date().toISOString();

  await writeAdminFile(
    state
  );
}


export const adminCookie = {
  name: COOKIE_NAME,
  maxAge:
    MAX_AGE_SECONDS
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
  const current =
    await sessionAdmin();

  if (!current) {
    throw new Error(
      "Admin session not found."
    );
  }

  if (
    !(
      await verifyAdminCredentials(
        current.username,
        currentPassword
      )
    )
  ) {
    throw new Error(
      "Current password is incorrect."
    );
  }

  const cleanUsername =
    username.trim();

  if (
    cleanUsername.length < 3
  ) {
    throw new Error(
      "Username must be at least 3 characters."
    );
  }

  if (
    newPassword &&
    newPassword.length < 10
  ) {
    throw new Error(
      "New password must be at least 10 characters."
    );
  }

  const state =
    await readAdminFile();

  const target =
    state.admins.find(
      (admin) =>
        admin.id ===
        current.id
    );

  if (!target) {
    throw new Error(
      "Admin account not found."
    );
  }

  const duplicate =
    state.admins.find(
      (admin) =>
        admin.id !==
          target.id &&
        sameUsername(
          admin.username,
          cleanUsername
        )
    );

  if (duplicate) {
    throw new Error(
      "That username is already in use."
    );
  }

  target.username =
    cleanUsername;

  if (
    newPassword?.trim()
  ) {
    const salt =
      crypto
        .randomBytes(16)
        .toString("hex");

    target.salt =
      salt;

    target.passwordHash =
      hashPassword(
        newPassword,
        salt
      );
  }

  target.updatedAt =
    new Date().toISOString();

  await writeAdminFile(
    state
  );
}
