/** @format */
/**
 * Domain App Error
 */

import { DomainError, ErrorCategory } from "./DomainError";

export class AppError extends DomainError {
  constructor(
    message: string,
    code = "APP_ERROR",
    details?: Record<string, unknown>,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    errorName = "AppError"
  ) {
    super(message, code, category, details, errorName);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", details, ErrorCategory.VALIDATION, "ValidationError");
    this.field = field;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(`${resource} not found`, "NOT_FOUND", details, ErrorCategory.NOT_FOUND, "NotFoundError");
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network unavailable", details?: Record<string, unknown>) {
    super(message, "NETWORK_ERROR", details, ErrorCategory.NETWORK, "NetworkError");
  }
}

export class TimeoutError extends AppError {
  constructor(message = "Request timed out", details?: Record<string, unknown>) {
    super(message, "TIMEOUT_ERROR", details, ErrorCategory.TIMEOUT, "TimeoutError");
  }
}

export class ServerError extends AppError {
  constructor(
    message = "Internal Server Error",
    code = "SERVER_ERROR",
    details?: Record<string, unknown>
  ) {
    super(message, code, details, ErrorCategory.SERVER, "ServerError");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", details?: Record<string, unknown>) {
    super(message, "RATE_LIMIT_ERROR", details, ErrorCategory.RATE_LIMIT, "RateLimitError");
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized", code = "AUTH_ERROR", details?: Record<string, unknown>) {
    super(message, code, details, ErrorCategory.AUTH, "AuthError");
  }
}

export class PermissionError extends AppError {
  constructor(message = "Permission denied", details?: Record<string, unknown>) {
    super(message, "PERMISSION_ERROR", details, ErrorCategory.PERMISSION, "PermissionError");
  }
}

export class CacheError extends AppError {
  constructor(message = "Cache error", details?: Record<string, unknown>) {
    super(message, "CACHE_ERROR", details, ErrorCategory.CACHE, "CacheError");
  }
}

export class SerializationError extends AppError {
  constructor(message = "Serialization error", details?: Record<string, unknown>) {
    super(
      message,
      "SERIALIZATION_ERROR",
      details,
      ErrorCategory.SERIALIZATION,
      "SerializationError"
    );
  }
}
