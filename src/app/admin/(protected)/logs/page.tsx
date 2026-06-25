import Link from "next/link";
import { AlertTriangle, Bug, Info, ShieldCheck } from "lucide-react";
import { listAppLogs } from "@/lib/app-logs";
import type { AppLogLevel } from "@/types/app-log";

const levelLabels: Record<AppLogLevel, string> = {
  debug: "Debug",
  info: "Info",
  warn: "Atenção",
  error: "Erro",
};

const levelTone: Record<AppLogLevel, string> = {
  debug: "bg-slate-100 text-slate-700",
  info: "bg-blue-50 text-blue-800",
  warn: "bg-amber-100 text-amber-900",
  error: "bg-red-100 text-red-800",
};

const levelIcon: Record<AppLogLevel, typeof Info> = {
  debug: Bug,
  info: Info,
  warn: AlertTriangle,
  error: AlertTriangle,
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));

const stringifyDetails = (details: Record<string, unknown>) =>
  Object.keys(details).length
    ? JSON.stringify(details, null, 2)
    : "Sem detalhes extras.";

const filterHref = (level?: AppLogLevel | "all") =>
  level && level !== "all" ? `/admin/logs?level=${level}` : "/admin/logs";

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level: levelParam } = await searchParams;
  const selectedLevel = ["debug", "info", "warn", "error"].includes(
    levelParam || "",
  )
    ? (levelParam as AppLogLevel)
    : "all";
  const logs = await listAppLogs({ level: selectedLevel, limit: 120 });
  const errorCount = logs.filter((log) => log.level === "error").length;
  const warnCount = logs.filter((log) => log.level === "warn").length;

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-brown">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
              Diagnóstico da loja
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
              Logs do sistema
            </h1>
            <p className="mt-2 max-w-2xl text-brand-ink/55">
              Aqui ficam os erros e eventos importantes do checkout,
              pagamentos, assinaturas e webhooks. Dados sensíveis são redigidos
              automaticamente.
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-brand-brown/10 bg-white p-4 text-sm shadow-card">
          <div className="flex items-center gap-2 font-extrabold text-brand-green">
            <ShieldCheck className="h-5 w-5" />
            Seguro para suporte
          </div>
          <p className="mt-2 max-w-xs text-brand-ink/50">
            Não gravamos número de cartão, CVV, token, senha ou CPF completo nos
            detalhes.
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Eventos exibidos", String(logs.length)],
          ["Erros", String(errorCount)],
          ["Atenções", String(warnCount)],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-3xl border border-brand-brown/10 bg-white p-5 shadow-card"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-brand-ink/45">
              {label}
            </p>
            <p className="mt-3 text-2xl font-extrabold text-brand-brown">
              {value}
            </p>
          </article>
        ))}
      </section>

      <nav className="mt-8 flex flex-wrap gap-2">
        {[
          ["Todos", "all"],
          ["Erros", "error"],
          ["Atenções", "warn"],
          ["Info", "info"],
          ["Debug", "debug"],
        ].map(([label, level]) => {
          const active = selectedLevel === level;
          return (
            <Link
              key={level}
              href={filterHref(level as AppLogLevel | "all")}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                active
                  ? "bg-brand-brown text-white"
                  : "border border-brand-brown/15 bg-white text-brand-brown hover:border-brand-brown"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <section className="mt-6 overflow-hidden rounded-3xl border border-brand-brown/10 bg-white shadow-card">
        {logs.length ? (
          <div className="divide-y divide-brand-brown/10">
            {logs.map((log) => {
              const Icon = levelIcon[log.level];
              return (
                <article key={log.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                            levelTone[log.level]
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {levelLabels[log.level]}
                        </span>
                        <span className="rounded-full bg-brand-cream/60 px-3 py-1 text-xs font-extrabold text-brand-brown">
                          {log.area}
                        </span>
                        <span className="text-xs font-bold text-brand-ink/40">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <h2 className="mt-3 break-words text-lg font-extrabold text-brand-brown">
                        {log.message}
                      </h2>
                      <p className="mt-1 break-words text-sm text-brand-ink/50">
                        Evento: <span className="font-bold">{log.event}</span>
                        {log.entityType && log.entityId
                          ? ` · ${log.entityType}: ${log.entityId}`
                          : ""}
                      </p>
                      {log.requestPath ? (
                        <p className="mt-1 break-words text-xs font-bold text-brand-ink/40">
                          Caminho: {log.requestPath}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <details className="mt-4 rounded-2xl bg-brand-mist/55 p-4">
                    <summary className="cursor-pointer text-sm font-extrabold text-brand-brown">
                      Ver detalhes técnicos
                    </summary>
                    <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-brand-ink/70">
                      {stringifyDetails(log.details)}
                    </pre>
                  </details>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Bug className="mx-auto h-10 w-10 text-brand-brown/30" />
            <p className="mt-4 font-extrabold text-brand-brown">
              Nenhum log encontrado
            </p>
            <p className="mt-2 text-sm text-brand-ink/45">
              Quando acontecer um erro importante, ele vai aparecer aqui.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
