export type AppLogLevel = "debug" | "info" | "warn" | "error";

export type AppLog = {
  id: string;
  level: AppLogLevel;
  area: string;
  event: string;
  message: string;
  details: Record<string, unknown>;
  entityType: string | null;
  entityId: string | null;
  requestPath: string | null;
  requestId: string | null;
  createdAt: string;
};
