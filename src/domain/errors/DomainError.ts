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
  public category: ErrorCategory = ErrorCategory.UNKNOWN;
  public code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  public readonly field?: string;

  constructor(message: string, field?: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", details);
    this.category = ErrorCategory.VALIDATION;
    this.field = field;
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(`${resource} not found`, "NOT_FOUND", details);
    this.category = ErrorCategory.NOT_FOUND;
  }
}
