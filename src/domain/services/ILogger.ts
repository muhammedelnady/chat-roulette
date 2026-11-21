/** @format */
/**
 * Domain Logger Interface
 */

export interface ILogger {
  silly(message: unknown, ...params: unknown[]): void;
  debug(message: unknown, ...params: unknown[]): void;
  info(message: unknown, ...params: unknown[]): void;
  warn(message: unknown, ...params: unknown[]): void;
  error(message: unknown, ...params: unknown[]): void;
  exception?(error: unknown, message?: string): void;
}
