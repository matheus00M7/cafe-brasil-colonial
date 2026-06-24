import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  decryptCustomerData,
  encryptCustomerData,
} from "@/lib/customer-crypto";
import type {
  CustomerAccount,
  CustomerProfile,
  CustomerSession,
} from "@/types/customer";
import type { StoredAddress } from "@/types/order";

type AccountRow = {
  id: string;
  email: string;
  password_hash: string;
  profile_cipher: string;
  address_cipher: string;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  token_hash: string;
  account_id: string;
  expires_at: string;
  created_at: string;
};

type ResetRow = {
  token_hash: string;
  account_id: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

const configuredPath = process.env.ORDER_DATABASE_PATH || "./data/orders.db";
const databasePath = isAbsolute(configuredPath)
  ? configuredPath
  : resolve(process.cwd(), configuredPath);
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);

const globalDatabase = globalThis as typeof globalThis & {
  cafeCustomerDatabase?: DatabaseSync;
};

const getLocalDatabase = () => {
  if (globalDatabase.cafeCustomerDatabase) {
    return globalDatabase.cafeCustomerDatabase;
  }
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS customer_accounts (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      profile_cipher TEXT NOT NULL,
      address_cipher TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_accounts_email
      ON customer_accounts(email);

    CREATE TABLE IF NOT EXISTS customer_sessions (
      token_hash TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(account_id) REFERENCES customer_accounts(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_customer_sessions_account
      ON customer_sessions(account_id);
    CREATE INDEX IF NOT EXISTS idx_customer_sessions_expiry
      ON customer_sessions(expires_at);

    CREATE TABLE IF NOT EXISTS customer_password_resets (
      token_hash TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(account_id) REFERENCES customer_accounts(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_customer_password_resets_account
      ON customer_password_resets(account_id);
  `);
  globalDatabase.cafeCustomerDatabase = database;
  return database;
};

const supabaseRequest = async <T>(path: string, init?: RequestInit) => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("O banco online não está configurado.");
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha no banco de clientes: ${detail.slice(0, 500)}`);
  }
  const raw = await response.text();
  if (!raw) return undefined as T;
  return JSON.parse(raw) as T;
};

const emptyAddress = (): StoredAddress => ({
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
});

const parseAccount = (row?: AccountRow): CustomerAccount | null => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    profile: decryptCustomerData<CustomerProfile>(row.profile_cipher),
    address: decryptCustomerData<StoredAddress>(row.address_cipher),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const createCustomerAccount = async (input: {
  id: string;
  email: string;
  passwordHash: string;
  profile: CustomerProfile;
}) => {
  const now = new Date().toISOString();
  const row: AccountRow = {
    id: input.id,
    email: input.email,
    password_hash: input.passwordHash,
    profile_cipher: encryptCustomerData(input.profile),
    address_cipher: encryptCustomerData(emptyAddress()),
    created_at: now,
    updated_at: now,
  };
  if (useSupabase) {
    const rows = await supabaseRequest<AccountRow[]>("customer_accounts", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    return parseAccount(rows[0]);
  }
  getLocalDatabase()
    .prepare(
      `INSERT INTO customer_accounts (
        id, email, password_hash, profile_cipher, address_cipher,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.email,
      row.password_hash,
      row.profile_cipher,
      row.address_cipher,
      row.created_at,
      row.updated_at,
    );
  return getCustomerAccountById(row.id);
};

const getAccountRowByEmail = async (email: string) => {
  if (useSupabase) {
    const rows = await supabaseRequest<AccountRow[]>(
      `customer_accounts?email=eq.${encodeURIComponent(email)}&limit=1`,
    );
    return rows[0];
  }
  return getLocalDatabase()
    .prepare("SELECT * FROM customer_accounts WHERE email = ?")
    .get(email) as AccountRow | undefined;
};

const getAccountRowById = async (id: string) => {
  if (useSupabase) {
    const rows = await supabaseRequest<AccountRow[]>(
      `customer_accounts?id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    return rows[0];
  }
  return getLocalDatabase()
    .prepare("SELECT * FROM customer_accounts WHERE id = ?")
    .get(id) as AccountRow | undefined;
};

export const getCustomerAccountByEmail = async (email: string) =>
  parseAccount(await getAccountRowByEmail(email));

export const getCustomerAccountById = async (id: string) =>
  parseAccount(await getAccountRowById(id));

export const listCustomerAccounts = async () => {
  const rows = useSupabase
    ? await supabaseRequest<AccountRow[]>(
        "customer_accounts?order=created_at.desc&limit=500",
      )
    : (getLocalDatabase()
        .prepare(
          "SELECT * FROM customer_accounts ORDER BY datetime(created_at) DESC",
        )
        .all() as unknown as AccountRow[]);
  return rows.map(parseAccount).filter(Boolean) as CustomerAccount[];
};

export const getCustomerPasswordHash = async (email: string) =>
  (await getAccountRowByEmail(email))?.password_hash || null;

export const updateCustomerDetails = async (
  id: string,
  profile: CustomerProfile,
  address: StoredAddress,
) => {
  const patch = {
    profile_cipher: encryptCustomerData(profile),
    address_cipher: encryptCustomerData(address),
    updated_at: new Date().toISOString(),
  };
  if (useSupabase) {
    const rows = await supabaseRequest<AccountRow[]>(
      `customer_accounts?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      },
    );
    return parseAccount(rows[0]);
  }
  getLocalDatabase()
    .prepare(
      `UPDATE customer_accounts
       SET profile_cipher = ?, address_cipher = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(
      patch.profile_cipher,
      patch.address_cipher,
      patch.updated_at,
      id,
    );
  return getCustomerAccountById(id);
};

export const updateCustomerPassword = async (
  id: string,
  passwordHash: string,
) => {
  const updatedAt = new Date().toISOString();
  if (useSupabase) {
    await supabaseRequest<AccountRow[]>(
      `customer_accounts?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          password_hash: passwordHash,
          updated_at: updatedAt,
        }),
      },
    );
  } else {
    getLocalDatabase()
      .prepare(
        "UPDATE customer_accounts SET password_hash = ?, updated_at = ? WHERE id = ?",
      )
      .run(passwordHash, updatedAt, id);
  }
  await deleteCustomerSessionsForAccount(id);
};

export const createCustomerSessionRecord = async (input: SessionRow) => {
  if (useSupabase) {
    await supabaseRequest<SessionRow[]>("customer_sessions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(input),
    });
  } else {
    getLocalDatabase()
      .prepare(
        `INSERT INTO customer_sessions (
          token_hash, account_id, expires_at, created_at
        ) VALUES (?, ?, ?, ?)`,
      )
      .run(
        input.token_hash,
        input.account_id,
        input.expires_at,
        input.created_at,
      );
  }
};

export const getCustomerSessionRecord = async (
  tokenHash: string,
): Promise<CustomerSession | null> => {
  let session: SessionRow | undefined;
  if (useSupabase) {
    const rows = await supabaseRequest<SessionRow[]>(
      `customer_sessions?token_hash=eq.${encodeURIComponent(
        tokenHash,
      )}&limit=1`,
    );
    session = rows[0];
  } else {
    session = getLocalDatabase()
      .prepare("SELECT * FROM customer_sessions WHERE token_hash = ?")
      .get(tokenHash) as SessionRow | undefined;
  }
  if (!session || new Date(session.expires_at).getTime() <= Date.now()) {
    if (session) await deleteCustomerSessionRecord(tokenHash);
    return null;
  }
  const account = await getCustomerAccountById(session.account_id);
  return account ? { account, expiresAt: session.expires_at } : null;
};

export const deleteCustomerSessionRecord = async (tokenHash: string) => {
  if (useSupabase) {
    await supabaseRequest<void>(
      `customer_sessions?token_hash=eq.${encodeURIComponent(tokenHash)}`,
      { method: "DELETE", headers: { Prefer: "return=minimal" } },
    );
  } else {
    getLocalDatabase()
      .prepare("DELETE FROM customer_sessions WHERE token_hash = ?")
      .run(tokenHash);
  }
};

export const deleteCustomerSessionsForAccount = async (accountId: string) => {
  if (useSupabase) {
    await supabaseRequest<void>(
      `customer_sessions?account_id=eq.${encodeURIComponent(accountId)}`,
      { method: "DELETE", headers: { Prefer: "return=minimal" } },
    );
  } else {
    getLocalDatabase()
      .prepare("DELETE FROM customer_sessions WHERE account_id = ?")
      .run(accountId);
  }
};

export const createPasswordResetRecord = async (input: ResetRow) => {
  if (useSupabase) {
    await supabaseRequest<ResetRow[]>("customer_password_resets", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(input),
    });
  } else {
    getLocalDatabase()
      .prepare(
        `INSERT INTO customer_password_resets (
          token_hash, account_id, expires_at, used_at, created_at
        ) VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        input.token_hash,
        input.account_id,
        input.expires_at,
        input.used_at,
        input.created_at,
      );
  }
};

export const consumePasswordResetRecord = async (tokenHash: string) => {
  let row: ResetRow | undefined;
  if (useSupabase) {
    const rows = await supabaseRequest<ResetRow[]>(
      `customer_password_resets?token_hash=eq.${encodeURIComponent(
        tokenHash,
      )}&used_at=is.null&limit=1`,
    );
    row = rows[0];
  } else {
    row = getLocalDatabase()
      .prepare(
        `SELECT * FROM customer_password_resets
         WHERE token_hash = ? AND used_at IS NULL`,
      )
      .get(tokenHash) as ResetRow | undefined;
  }
  if (!row || new Date(row.expires_at).getTime() <= Date.now()) return null;
  const usedAt = new Date().toISOString();
  if (useSupabase) {
    await supabaseRequest<void>(
      `customer_password_resets?token_hash=eq.${encodeURIComponent(tokenHash)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ used_at: usedAt }),
      },
    );
  } else {
    getLocalDatabase()
      .prepare(
        "UPDATE customer_password_resets SET used_at = ? WHERE token_hash = ?",
      )
      .run(usedAt, tokenHash);
  }
  return row.account_id;
};
