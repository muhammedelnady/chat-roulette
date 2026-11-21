/** @format */
/**
 * Domain Errors
 */

export enum ErrorCategory {
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  AUTH = "auth",
  NETWORK = "network",
  SERVER = "server",
  DATABASE = "database",
  CACHE = "cache",
  TIMEOUT = "timeout",
  SERIALIZATION = "serialization",
  PERMISSION = "permission",
  RATE_LIMIT = "rate_limit",
  UNKNOWN = "unknown",
}

export abstract class DomainError extends Error {
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    details?: Record<string, unknown>,
    errorName = "DomainError"
  ) {
    super(message);
    this.code = code;
    this.category = category;
    this.details = details;
    this.name = errorName;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
