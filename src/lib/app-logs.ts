import "server-only";

import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import type { AppLog, AppLogLevel } from "@/types/app-log";

type AppLogRow = {
  id: string;
  level: AppLogLevel;
  area: string;
  event: string;
  message: string;
  details_json: string | Record<string, unknown> | null;
  entity_type: string | null;
  entity_id: string | null;
  request_path: string | null;
  request_id: string | null;
  created_at: string;
};

type CreateAppLogInput = {
  level: AppLogLevel;
  area: string;
  event: string;
  message: string;
  details?: Record<string, unknown>;
  entityType?: string | null;
  entityId?: string | null;
  requestPath?: string | null;
  requestId?: string | null;
};

type ListAppLogsFilters = {
  level?: AppLogLevel | "all";
  area?: string;
  limit?: number;
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
  cafeLogsDatabase?: SQLiteDatabase;
};

const sensitiveKeyPattern =
  /(token|secret|password|authorization|apikey|api_key|access[_-]?token|card[_-]?token|cardnumber|card_number|securitycode|security_code|cvv|cpf|document|identification|cookie|signature|hash)/i;

const redactString = (value: string) =>
  value
    .replace(/TEST-[A-Za-z0-9._:-]{8,}/g, "TEST-***")
    .replace(/APP_USR-[A-Za-z0-9._:-]{8,}/g, "APP_USR-***")
    .replace(/sb_secret_[A-Za-z0-9._:-]{8,}/g, "sb_secret_***")
    .replace(/Bearer\s+[A-Za-z0-9._:-]{8,}/gi, "Bearer ***");

const sanitizeDetails = (value: unknown, depth = 0): unknown => {
  if (depth > 5) return "[limite de profundidade]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactString(value).slice(0, 1000);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeDetails(item, depth + 1));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 50)
        .map(([key, item]) => [
          key,
          sensitiveKeyPattern.test(key)
            ? "[redigido]"
            : sanitizeDetails(item, depth + 1),
        ]),
    );
  }
  return String(value).slice(0, 500);
};

const parseJson = (value: AppLogRow["details_json"]) => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return { raw: value.slice(0, 1000) };
    }
  }
  return value;
};

const parseLog = (row: AppLogRow): AppLog => ({
  id: row.id,
  level: row.level,
  area: row.area,
  event: row.event,
  message: row.message,
  details: parseJson(row.details_json),
  entityType: row.entity_type,
  entityId: row.entity_id,
  requestPath: row.request_path,
  requestId: row.request_id,
  createdAt: row.created_at,
});

const getLocalDatabase = async () => {
  if (localDatabaseUnavailable) {
    throw new Error("Banco online não configurado para registrar logs.");
  }
  if (globalDatabase.cafeLogsDatabase) {
    return globalDatabase.cafeLogsDatabase;
  }

  const { DatabaseSync } = await import("node:sqlite");
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS app_logs (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      area TEXT NOT NULL,
      event TEXT NOT NULL,
      message TEXT NOT NULL,
      details_json TEXT NOT NULL DEFAULT '{}',
      entity_type TEXT,
      entity_id TEXT,
      request_path TEXT,
      request_id TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_app_logs_created_at
      ON app_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_app_logs_level
      ON app_logs(level);
    CREATE INDEX IF NOT EXISTS idx_app_logs_area
      ON app_logs(area);
  `);
  globalDatabase.cafeLogsDatabase = database;
  return database;
};

const supabaseRequest = async <T>(path: string, init?: RequestInit) => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Banco online não configurado.");
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
    throw new Error(`Falha no banco de logs: ${(await response.text()).slice(0, 500)}`);
  }
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
};

export const createAppLog = async (input: CreateAppLogInput) => {
  const row: AppLogRow = {
    id: randomUUID(),
    level: input.level,
    area: input.area.trim().slice(0, 80) || "app",
    event: input.event.trim().slice(0, 120) || "event",
    message: input.message.trim().slice(0, 500) || "Evento registrado.",
    details_json: sanitizeDetails(input.details || {}) as Record<
      string,
      unknown
    >,
    entity_type: input.entityType?.trim().slice(0, 60) || null,
    entity_id: input.entityId?.trim().slice(0, 140) || null,
    request_path: input.requestPath?.trim().slice(0, 300) || null,
    request_id: input.requestId?.trim().slice(0, 140) || null,
    created_at: new Date().toISOString(),
  };

  try {
    if (useSupabase) {
      await supabaseRequest<AppLogRow[]>("app_logs", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(row),
      });
    } else {
      const database = await getLocalDatabase();
      database
        .prepare(
          `INSERT INTO app_logs (
            id, level, area, event, message, details_json,
            entity_type, entity_id, request_path, request_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          row.id,
          row.level,
          row.area,
          row.event,
          row.message,
          JSON.stringify(row.details_json),
          row.entity_type,
          row.entity_id,
          row.request_path,
          row.request_id,
          row.created_at,
        );
    }
  } catch (error) {
    console.warn("[app_logs] não foi possível gravar o log", {
      area: row.area,
      event: row.event,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const listAppLogs = async (
  filters: ListAppLogsFilters = {},
): Promise<AppLog[]> => {
  const limit = Math.min(Math.max(filters.limit || 100, 1), 300);
  const level = filters.level && filters.level !== "all" ? filters.level : "";
  const area = filters.area?.trim().slice(0, 80) || "";

  try {
    if (useSupabase) {
      const params = new URLSearchParams({
        order: "created_at.desc",
        limit: String(limit),
      });
      if (level) params.set("level", `eq.${level}`);
      if (area) params.set("area", `eq.${area}`);
      const rows = await supabaseRequest<AppLogRow[]>(
        `app_logs?${params.toString()}`,
      );
      return rows.map(parseLog);
    }

    if (localDatabaseUnavailable) return [];
    const database = await getLocalDatabase();
    const where: string[] = [];
    const args: Array<string | number> = [];
    if (level) {
      where.push("level = ?");
      args.push(level);
    }
    if (area) {
      where.push("area = ?");
      args.push(area);
    }
    args.push(limit);
    const sql = `SELECT * FROM app_logs ${
      where.length ? `WHERE ${where.join(" AND ")}` : ""
    } ORDER BY datetime(created_at) DESC LIMIT ?`;
    const rows = database.prepare(sql).all(...args) as unknown as AppLogRow[];
    return rows.map(parseLog);
  } catch (error) {
    return [
      {
        id: "logs-unavailable",
        level: "warn",
        area: "logs",
        event: "logs_unavailable",
        message:
          "A tabela de logs ainda não está disponível. Execute o schema atualizado no Supabase.",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
        entityType: null,
        entityId: null,
        requestPath: null,
        requestId: null,
        createdAt: new Date().toISOString(),
      },
    ];
  }
};

export const clearAppLogs = async () => {
  if (useSupabase) {
    await supabaseRequest<void>("app_logs?id=not.is.null", {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    return;
  }

  if (localDatabaseUnavailable) {
    throw new Error("Banco online não configurado para limpar logs.");
  }

  const database = await getLocalDatabase();
  database.prepare("DELETE FROM app_logs").run();
};
