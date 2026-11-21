/** @format */
/**
 * Data Logger
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silly";

export interface AppLogger {
  silly(message: unknown, ...params: unknown[]): void;
  debug(message: unknown, ...params: unknown[]): void;
  info(message: unknown, ...params: unknown[]): void;
  warn(message: unknown, ...params: unknown[]): void;
  error(message: unknown, ...params: unknown[]): void;
  exception(error: unknown, message?: string): void;
  createChild(prefix: string): AppLogger;
  setSeverity(level: string): void;
  getSeverity(): string;
}

const RING_SIZE = 200;
const REDACT_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "refreshtoken",
  "accesstoken",
  "secret",
  "apikey",
  "api_key",
]);

const LEVELS: LogLevel[] = ["silly", "debug", "info", "warn", "error"];

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  ts: number;
}

const ring: LogEntry[] = [];
let _minLevel: LogLevel = __DEV__ ? "debug" : "warn";

function redact(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value)) return value.map(redact);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      REDACT_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : redact(v),
    ])
  );
}

function fmt(prefix: string, message: unknown): string {
  if (message instanceof Error) {
    const errMsg = message.stack ? `${message.message}\n${message.stack}` : message.message;
    return prefix ? `[${prefix}] ${errMsg}` : errMsg;
  }

  let msg: string;
  if (typeof message === "string") {
    try {
      const parsed: unknown = JSON.parse(message);
      msg =
        typeof parsed === "object" && parsed !== null ? JSON.stringify(redact(parsed)) : message;
    } catch {
      msg = message;
    }
  } else {
    msg = JSON.stringify(redact(message));
  }

  return prefix ? `[${prefix}] ${msg}` : msg;
}

function write(level: LogLevel, prefix: string, message: unknown, params: unknown[]): void {
  if (LEVELS.indexOf(level) < LEVELS.indexOf(_minLevel)) return;

  const entry: LogEntry = {
    level,
    message: fmt(prefix, message),
    data: params.length > 0 ? redact(params) : undefined,
    ts: Date.now(),
  };
  ring.push(entry);
  if (ring.length > RING_SIZE) ring.shift();

  if (__DEV__) {
    const out = params.length ? [entry.data] : [];
    const consoleFn = level === "error" ? console.error : console.warn;
    consoleFn(entry.message, ...out);
  }
}

const createLoggerInstance = (prefix = ""): AppLogger => ({
  silly: (msg, ...params) => write("silly", prefix, msg, params),
  debug: (msg, ...params) => write("debug", prefix, msg, params),
  info: (msg, ...params) => write("info", prefix, msg, params),
  warn: (msg, ...params) => write("warn", prefix, msg, params),
  error: (msg, ...params) => write("error", prefix, msg, params),
  exception: (error, message) => {
    const header = message ? `${message} — ` : "";
    if (error instanceof Error) {
      write("error", prefix, `${header}${error.name}: ${error.message}`, [error.stack]);
    } else {
      write("error", prefix, `${header}${String(error)}`, []);
    }
  },
  createChild: (childPrefix) =>
    createLoggerInstance(prefix ? `${prefix}:${childPrefix}` : childPrefix),
  setSeverity: (level: string) => {
    if ((LEVELS as string[]).includes(level)) _minLevel = level as LogLevel;
  },
  getSeverity: () => _minLevel,
});

export const log: AppLogger = Object.freeze(createLoggerInstance());
export const getLogs = (): readonly LogEntry[] => [...ring];
export const clearLogs = (): void => {
  ring.length = 0;
};
