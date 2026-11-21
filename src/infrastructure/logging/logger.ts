/** @format */
/**
 * Infrastructure Logger
 */

import { consoleTransport, logger as rnLogger } from "react-native-logs";

const REDACT_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "refreshtoken",
  "accesstoken",
  "secret",
  "apikey",
  "api_key",
  "cookie",
  "set-cookie",
  "x-guest-session-id",
  "guestsessionid",
  "bearer",
  "x-api-key",
  "encryptionkey",
]);

function redactString(input: string): string {
  const bearerRedacted = input.replace(/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]");
  const trimmed = bearerRedacted.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      const parsed: unknown = JSON.parse(bearerRedacted);
      if (typeof parsed === "object" && parsed !== null) {
        return JSON.stringify(redact(parsed));
      }
    } catch {}
  }
  return bearerRedacted;
}

function redact(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }
  if (value instanceof Error) {
    return { name: value.name, message: redactString(value.message), stack: value.stack };
  }
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) {
    return "[Circular]";
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => redact(item, seen));
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      REDACT_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : redact(v, seen),
    ])
  );
}

const APP_LEVELS = {
  silly: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const;

type AppLevel = keyof typeof APP_LEVELS;

export interface AppLogger {
  silly(message: unknown, ...params: unknown[]): void;
  debug(message: unknown, ...params: unknown[]): void;
  info(message: unknown, ...params: unknown[]): void;
  warn(message: unknown, ...params: unknown[]): void;
  error(message: unknown, ...params: unknown[]): void;
  exception(error: unknown, message?: string): void;
  createChild(prefix: string): AppLogger;
  setSeverity(level: AppLevel): void;
  getSeverity(): AppLevel;
}

type RnLog = Record<AppLevel, (message: unknown, ...params: unknown[]) => void> & {
  setSeverity(level: string): void;
  getSeverity(): string;
};

class Logger implements AppLogger {
  private static instance: Logger | null = null;
  private readonly rn: RnLog;
  private readonly prefix: string;

  private constructor(prefix = "") {
    this.prefix = prefix;
    this.rn = rnLogger.createLogger({
      levels: APP_LEVELS,
      severity: __DEV__ ? "debug" : "warn",
      transport: consoleTransport,
      transportOptions: {
        colors: {
          silly: "magenta",
          debug: "cyanBright",
          info: "blueBright",
          warn: "yellowBright",
          error: "redBright",
        },
      },
      async: true,
      dateFormat: "time",
      printLevel: true,
      printDate: true,
      fixedExtLvlLength: true,
      enabled: true,
    });
  }

  public static getInstance(): Logger {
    Logger.instance ??= new Logger();
    return Logger.instance;
  }

  private shouldLog(level: AppLevel): boolean {
    const current = this.getSeverity();
    return APP_LEVELS[level] >= APP_LEVELS[current];
  }

  private fmt(message: unknown): string {
    if (message instanceof Error) {
      const cleanMessage = redactString(message.message);
      const errMsg = message.stack ? `${cleanMessage}\n${message.stack}` : cleanMessage;
      return this.prefix ? `[${this.prefix}] ${errMsg}` : errMsg;
    }
    let msg: string;
    if (typeof message === "string") {
      msg = redactString(message);
    } else {
      try {
        msg = JSON.stringify(redact(message));
      } catch {
        msg = "[Unserializable]";
      }
    }
    return this.prefix ? `[${this.prefix}] ${msg}` : msg;
  }

  private write(level: AppLevel, message: unknown, params: unknown[]): void {
    if (!this.shouldLog(level)) return;
    this.rn[level](this.fmt(message), ...params.map((item) => redact(item)));
  }

  public silly(message: unknown, ...params: unknown[]): void {
    this.write("silly", message, params);
  }

  public debug(message: unknown, ...params: unknown[]): void {
    this.write("debug", message, params);
  }

  public info(message: unknown, ...params: unknown[]): void {
    this.write("info", message, params);
  }

  public warn(message: unknown, ...params: unknown[]): void {
    this.write("warn", message, params);
  }

  public error(message: unknown, ...params: unknown[]): void {
    this.write("error", message, params);
  }

  public exception(error: unknown, message?: string): void {
    if (!this.shouldLog("error")) return;
    const header = message ? `${redactString(message)} — ` : "";
    if (error instanceof Error) {
      this.rn.error(this.fmt(`${header}${error.name}: ${redactString(error.message)}`));
    } else {
      this.rn.error(this.fmt(`${header}${redactString(String(error))}`));
    }
  }

  public createChild(prefix: string): AppLogger {
    const parent = this;
    const tag = (msg: unknown) => {
      if (msg instanceof Error) {
        return `[${prefix}] ${redactString(msg.message)}`;
      }
      if (typeof msg === "string") {
        return `[${prefix}] ${redactString(msg)}`;
      }
      try {
        return `[${prefix}] ${JSON.stringify(redact(msg))}`;
      } catch {
        return `[${prefix}] [Unserializable]`;
      }
    };

    return {
      silly: (msg, ...p) => {
        if (parent.shouldLog("silly")) parent.silly(tag(msg), ...p);
      },
      debug: (msg, ...p) => {
        if (parent.shouldLog("debug")) parent.debug(tag(msg), ...p);
      },
      info: (msg, ...p) => {
        if (parent.shouldLog("info")) parent.info(tag(msg), ...p);
      },
      warn: (msg, ...p) => {
        if (parent.shouldLog("warn")) parent.warn(tag(msg), ...p);
      },
      error: (msg, ...p) => {
        if (parent.shouldLog("error")) parent.error(tag(msg), ...p);
      },
      exception: (err, msg) => parent.exception(err, msg ? `[${prefix}] ${msg}` : `[${prefix}]`),
      createChild: (child) => parent.createChild(`${prefix}:${child}`),
      setSeverity: (level) => parent.setSeverity(level),
      getSeverity: () => parent.getSeverity(),
    };
  }

  public setSeverity(level: AppLevel): void {
    this.rn.setSeverity(level);
  }

  public getSeverity(): AppLevel {
    return typeof this.rn.getSeverity === "function"
      ? (this.rn.getSeverity() as AppLevel)
      : "debug";
  }
}

export const log: AppLogger = Object.freeze(Logger.getInstance());

export { Logger };
