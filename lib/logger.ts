/**
 * Minimal structured logger.
 *
 * Every log line is a single JSON object so it can be picked up as-is by
 * whatever aggregates stdout/stderr in production (Vercel Logs, Logtail,
 * Datadog, Axiom, etc). In development it prints a shorter human-readable
 * line instead.
 *
 * This intentionally has zero external dependencies. If/when the project
 * wires up a dedicated error-tracking service (Sentry, Better Stack, etc.)
 * the `report` hook below is the single place to forward `error()` calls to
 * it — see docs/OPERATIONS.md.
 */

type Level = "debug" | "info" | "warn" | "error";

type Meta = Record<string, unknown> | undefined;

const isProd = process.env.NODE_ENV === "production";

function safeMeta(meta: Meta) {
  if (meta === undefined) return undefined;
  try {
    // Guards against circular refs / huge objects blowing up the log line.
    return JSON.parse(JSON.stringify(meta));
  } catch {
    return { unserializable: String(meta) };
  }
}

function emit(level: Level, event: string, meta?: Meta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(safeMeta(meta) ?? {}),
  };

  const line = isProd ? JSON.stringify(entry) : formatPretty(entry);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);

  if (level === "error") {
    report(event, meta).catch(() => {
      /* never let telemetry break the request */
    });
  }
}

function formatPretty(entry: Record<string, unknown>) {
  const { ts, level, event, ...rest } = entry;
  const extra = Object.keys(rest).length ? JSON.stringify(rest) : "";
  return `[${ts}] [${String(level).toUpperCase()}] ${event} ${extra}`;
}

/**
 * Forward errors to an external error-tracking service when one is
 * configured. Wired up as a lazy dynamic import so the app has zero hard
 * dependency on any particular provider until `ERROR_REPORTING_WEBHOOK`
 * (or a proper SDK) is set up. See docs/OPERATIONS.md for options.
 */
async function report(event: string, meta?: Meta) {
  const webhook = process.env.ERROR_REPORTING_WEBHOOK;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, meta, ts: new Date().toISOString() }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Swallow — logging must never throw or block the response.
  }
}

function toMeta(err: unknown): Meta {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack, name: err.name };
  }
  return { value: err };
}

export const logger = {
  debug: (event: string, meta?: Meta) => {
    if (!isProd) emit("debug", event, meta);
  },
  info: (event: string, meta?: Meta) => emit("info", event, meta),
  warn: (event: string, meta?: Meta) => emit("warn", event, meta),
  error: (event: string, err?: unknown, meta?: Meta) =>
    emit("error", event, { ...(meta ?? {}), ...toMeta(err) }),
};