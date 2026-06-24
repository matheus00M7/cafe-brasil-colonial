import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import type {
  StoredSubscription,
  SubscriptionAddress,
  SubscriptionCustomer,
  SubscriptionGrind,
} from "@/types/subscription";

type SubscriptionRow = {
  id: string;
  customer_account_id: string | null;
  subscription_number: string;
  mercado_pago_id: string | null;
  status: string;
  customer_json: string | SubscriptionCustomer;
  address_json: string | SubscriptionAddress;
  plan_id: string;
  plan_name: string;
  option_id: string;
  coffee: string;
  quantity: string;
  grind: string;
  frequency_months: number;
  amount: number;
  payment_method: string | null;
  next_payment_date: string | null;
  last_error: string;
  management_token_hash: string;
  created_at: string;
  updated_at: string;
};

type CreateRecordInput = {
  id: string;
  customerAccountId?: string | null;
  subscriptionNumber: string;
  customer: SubscriptionCustomer;
  address: SubscriptionAddress;
  planId: string;
  planName: string;
  optionId: string;
  coffee: string;
  quantity: string;
  grind: SubscriptionGrind;
  frequencyMonths: number;
  amount: number;
  managementTokenHash: string;
};

type UpdateRecordInput = {
  mercadoPagoId?: string | null;
  status: string;
  paymentMethod?: string | null;
  nextPaymentDate?: string | null;
  lastError?: string;
};

const configuredDatabasePath =
  process.env.ORDER_DATABASE_PATH || "./data/orders.db";
const databasePath = isAbsolute(configuredDatabasePath)
  ? configuredDatabasePath
  : resolve(process.cwd(), configuredDatabasePath);
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);
const isVercelRuntime = process.env.VERCEL === "1";
const localDatabaseUnavailable = !useSupabase && isVercelRuntime;

type SQLiteDatabase = InstanceType<typeof import("node:sqlite").DatabaseSync>;

const globalDatabase = globalThis as typeof globalThis & {
  cafeSubscriptionsDatabase?: SQLiteDatabase;
};

const databaseConfigurationError = () =>
  new Error(
    "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel para usar assinaturas.",
  );

const getLocalDatabase = async () => {
  if (localDatabaseUnavailable) {
    throw databaseConfigurationError();
  }
  if (globalDatabase.cafeSubscriptionsDatabase) {
    return globalDatabase.cafeSubscriptionsDatabase;
  }
  const { DatabaseSync } = await import("node:sqlite");
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      customer_account_id TEXT,
      subscription_number TEXT NOT NULL UNIQUE,
      mercado_pago_id TEXT UNIQUE,
      status TEXT NOT NULL,
      customer_json TEXT NOT NULL,
      address_json TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      option_id TEXT NOT NULL,
      coffee TEXT NOT NULL,
      quantity TEXT NOT NULL,
      grind TEXT NOT NULL,
      frequency_months INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT,
      next_payment_date TEXT,
      last_error TEXT NOT NULL DEFAULT '',
      management_token_hash TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status
      ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_mp
      ON subscriptions(mercado_pago_id);
  `);
  const columns = database
    .prepare("PRAGMA table_info(subscriptions)")
    .all() as Array<{ name: string }>;
  if (!columns.some(({ name }) => name === "management_token_hash")) {
    database.exec(
      "ALTER TABLE subscriptions ADD COLUMN management_token_hash TEXT NOT NULL DEFAULT ''",
    );
  }
  if (!columns.some(({ name }) => name === "customer_account_id")) {
    database.exec(
      "ALTER TABLE subscriptions ADD COLUMN customer_account_id TEXT",
    );
  }
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_account
      ON subscriptions(customer_account_id);
  `);
  globalDatabase.cafeSubscriptionsDatabase = database;
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
    throw new Error(`Falha no banco online: ${(await response.text()).slice(0, 500)}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

const parseJson = <T>(value: string | T): T =>
  typeof value === "string" ? (JSON.parse(value) as T) : value;

const parseSubscription = (
  row?: SubscriptionRow,
): StoredSubscription | null => {
  if (!row) return null;
  return {
    id: row.id,
    customerAccountId: row.customer_account_id,
    subscriptionNumber: row.subscription_number,
    mercadoPagoId: row.mercado_pago_id,
    status: row.status,
    customer: parseJson<SubscriptionCustomer>(row.customer_json),
    address: parseJson<SubscriptionAddress>(row.address_json),
    planId: row.plan_id,
    planName: row.plan_name,
    optionId: row.option_id,
    coffee: row.coffee,
    quantity: row.quantity,
    grind: row.grind as SubscriptionGrind,
    frequencyMonths: Number(row.frequency_months),
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    nextPaymentDate: row.next_payment_date,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const createRow = (input: CreateRecordInput): SubscriptionRow => {
  const now = new Date().toISOString();
  return {
    id: input.id,
    customer_account_id: input.customerAccountId || null,
    subscription_number: input.subscriptionNumber,
    mercado_pago_id: null,
    status: "creating",
    customer_json: input.customer,
    address_json: input.address,
    plan_id: input.planId,
    plan_name: input.planName,
    option_id: input.optionId,
    coffee: input.coffee,
    quantity: input.quantity,
    grind: input.grind,
    frequency_months: input.frequencyMonths,
    amount: input.amount,
    payment_method: null,
    next_payment_date: null,
    last_error: "",
    management_token_hash: input.managementTokenHash,
    created_at: now,
    updated_at: now,
  };
};

export const createSubscriptionRecord = async (input: CreateRecordInput) => {
  const row = createRow(input);
  if (useSupabase) {
    const rows = await supabaseRequest<SubscriptionRow[]>("subscriptions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    return parseSubscription(rows[0]);
  }

  const database = await getLocalDatabase();
  database
    .prepare(
      `INSERT INTO subscriptions (
        id, customer_account_id, subscription_number, mercado_pago_id, status,
        customer_json, address_json, plan_id, plan_name, option_id,
        coffee, quantity, grind, frequency_months, amount,
        payment_method, next_payment_date, last_error,
        management_token_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.customer_account_id,
      row.subscription_number,
      row.mercado_pago_id,
      row.status,
      JSON.stringify(row.customer_json),
      JSON.stringify(row.address_json),
      row.plan_id,
      row.plan_name,
      row.option_id,
      row.coffee,
      row.quantity,
      row.grind,
      row.frequency_months,
      row.amount,
      row.payment_method,
      row.next_payment_date,
      row.last_error,
      row.management_token_hash,
      row.created_at,
      row.updated_at,
    );
  return getSubscriptionById(row.id);
};

export const updateSubscriptionRecord = async (
  id: string,
  input: UpdateRecordInput,
) => {
  const patch = {
    ...(input.mercadoPagoId !== undefined
      ? { mercado_pago_id: input.mercadoPagoId }
      : {}),
    status: input.status,
    ...(input.paymentMethod !== undefined
      ? { payment_method: input.paymentMethod }
      : {}),
    ...(input.nextPaymentDate !== undefined
      ? { next_payment_date: input.nextPaymentDate }
      : {}),
    ...(input.lastError !== undefined
      ? { last_error: input.lastError.slice(0, 1500) }
      : {}),
    updated_at: new Date().toISOString(),
  };

  if (useSupabase) {
    const rows = await supabaseRequest<SubscriptionRow[]>(
      `subscriptions?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      },
    );
    return parseSubscription(rows[0]);
  }

  const current = await getSubscriptionById(id);
  if (!current) return null;
  const database = await getLocalDatabase();
  database
    .prepare(
      `UPDATE subscriptions SET
        mercado_pago_id = ?,
        status = ?,
        payment_method = ?,
        next_payment_date = ?,
        last_error = ?,
        updated_at = ?
      WHERE id = ?`,
    )
    .run(
      input.mercadoPagoId !== undefined
        ? input.mercadoPagoId
        : current.mercadoPagoId,
      input.status,
      input.paymentMethod !== undefined
        ? input.paymentMethod
        : current.paymentMethod,
      input.nextPaymentDate !== undefined
        ? input.nextPaymentDate
        : current.nextPaymentDate,
      input.lastError !== undefined ? input.lastError.slice(0, 1500) : current.lastError,
      patch.updated_at,
      id,
    );
  return getSubscriptionById(id);
};

export const getSubscriptionById = async (id: string) => {
  if (useSupabase) {
    const rows = await supabaseRequest<SubscriptionRow[]>(
      `subscriptions?id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    return parseSubscription(rows[0]);
  }
  if (localDatabaseUnavailable) return null;
  return parseSubscription(
    (await getLocalDatabase())
      .prepare("SELECT * FROM subscriptions WHERE id = ?")
      .get(id) as SubscriptionRow | undefined,
  );
};

export const getSubscriptionByMercadoPagoId = async (id: string) => {
  if (useSupabase) {
    const rows = await supabaseRequest<SubscriptionRow[]>(
      `subscriptions?mercado_pago_id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    return parseSubscription(rows[0]);
  }
  if (localDatabaseUnavailable) return null;
  return parseSubscription(
    (await getLocalDatabase())
      .prepare("SELECT * FROM subscriptions WHERE mercado_pago_id = ?")
      .get(id) as SubscriptionRow | undefined,
  );
};

export const listSubscriptions = async () => {
  const rows = useSupabase
    ? await supabaseRequest<SubscriptionRow[]>(
        "subscriptions?order=created_at.desc&limit=500",
      )
    : localDatabaseUnavailable
      ? []
    : ((await getLocalDatabase())
        .prepare(
          "SELECT * FROM subscriptions ORDER BY datetime(created_at) DESC",
        )
        .all() as unknown as SubscriptionRow[]);
  return rows.map(parseSubscription).filter(Boolean) as StoredSubscription[];
};

export const listSubscriptionsByCustomerAccountId = async (
  accountId: string,
) => {
  const rows = useSupabase
    ? await supabaseRequest<SubscriptionRow[]>(
        `subscriptions?customer_account_id=eq.${encodeURIComponent(
          accountId,
        )}&order=created_at.desc&limit=200`,
      )
    : localDatabaseUnavailable
      ? []
    : ((await getLocalDatabase())
        .prepare(
          `SELECT * FROM subscriptions
           WHERE customer_account_id = ?
           ORDER BY datetime(created_at) DESC`,
        )
        .all(accountId) as unknown as SubscriptionRow[]);
  return rows.map(parseSubscription).filter(Boolean) as StoredSubscription[];
};

export const getSubscriptionForCustomer = async (
  id: string,
  accountId: string,
) => {
  const subscription = await getSubscriptionById(id);
  return subscription?.customerAccountId === accountId ? subscription : null;
};

const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const verifySubscriptionManagementToken = async (
  id: string,
  token: string,
) => {
  let storedHash = "";
  if (useSupabase) {
    const rows = await supabaseRequest<
      Array<{ management_token_hash: string }>
    >(
      `subscriptions?id=eq.${encodeURIComponent(
        id,
      )}&select=management_token_hash&limit=1`,
    );
    storedHash = rows[0]?.management_token_hash || "";
  } else {
    if (localDatabaseUnavailable) return false;
    const row = (await getLocalDatabase())
      .prepare(
        "SELECT management_token_hash FROM subscriptions WHERE id = ?",
      )
      .get(id) as { management_token_hash?: string } | undefined;
    storedHash = row?.management_token_hash || "";
  }

  const receivedHash = tokenHash(token);
  const stored = Buffer.from(storedHash);
  const received = Buffer.from(receivedHash);
  return (
    stored.length > 0 &&
    stored.length === received.length &&
    timingSafeEqual(stored, received)
  );
};
