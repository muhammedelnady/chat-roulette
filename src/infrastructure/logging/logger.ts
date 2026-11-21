/** @format */
/**
 * Infrastructure Logger
 */

import { consoleTransport, logger as rnLogger } from "react-native-logs";

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

  private fmt(message: unknown): string {
    if (message instanceof Error) {
      const errMsg = message.stack ? `${message.message}\n${message.stack}` : message.message;
      return this.prefix ? `[${this.prefix}] ${errMsg}` : errMsg;
    }
    const msg = typeof message === "string" ? message : JSON.stringify(message);
    return this.prefix ? `[${this.prefix}] ${msg}` : msg;
  }

  public silly(message: unknown, ...params: unknown[]): void {
    this.rn.silly(this.fmt(message), ...params);
  }

  public debug(message: unknown, ...params: unknown[]): void {
    this.rn.debug(this.fmt(message), ...params);
  }

  public info(message: unknown, ...params: unknown[]): void {
    this.rn.info(this.fmt(message), ...params);
  }

  public warn(message: unknown, ...params: unknown[]): void {
    this.rn.warn(this.fmt(message), ...params);
  }

  public error(message: unknown, ...params: unknown[]): void {
    this.rn.error(this.fmt(message), ...params);
  }

  public exception(error: unknown, message?: string): void {
    const header = message ? `${message} — ` : "";
    if (error instanceof Error) {
      this.rn.error(this.fmt(`${header}${error.name}: ${error.message}`));
    } else {
      this.rn.error(this.fmt(`${header}${String(error)}`));
    }
  }

  public createChild(prefix: string): AppLogger {
    const parent = this;
    const tag = (msg: unknown) => {
      if (msg instanceof Error) {
        return parent.fmt(`[${prefix}] ${msg.message}`);
      }
      return parent.fmt(`[${prefix}] ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
    };

    return {
      silly: (msg, ...p) => parent.rn.silly(tag(msg), ...p),
      debug: (msg, ...p) => parent.rn.debug(tag(msg), ...p),
      info: (msg, ...p) => parent.rn.info(tag(msg), ...p),
      warn: (msg, ...p) => parent.rn.warn(tag(msg), ...p),
      error: (msg, ...p) => parent.rn.error(tag(msg), ...p),
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
    return this.rn.getSeverity() as AppLevel;
  }
}

export const log: AppLogger = Object.freeze(Logger.getInstance());

export { Logger };
