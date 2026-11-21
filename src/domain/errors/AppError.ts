/** @format */
/**
 * Domain App Error
 */

import { DomainError, ErrorCategory } from "./DomainError";

export class AppError extends DomainError {
  constructor(message: string, code = "APP_ERROR", details?: Record<string, unknown>) {
    super(message, code, details);
    this.category = ErrorCategory.UNKNOWN;
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network unavailable", details?: Record<string, unknown>) {
    super(message, "NETWORK_ERROR", details);
    this.category = ErrorCategory.NETWORK;
  }
}

export class TimeoutError extends NetworkError {
  constructor(message = "Request timed out", details?: Record<string, unknown>) {
    super(message, details);
    this.code = "TIMEOUT_ERROR";
    this.category = ErrorCategory.TIMEOUT;
  }
}

export class ServerError extends AppError {
  constructor(
    message = "Internal Server Error",
    code = "SERVER_ERROR",
    details?: Record<string, unknown>
  ) {
    super(message, code, details);
    this.category = ErrorCategory.SERVER;
  }
}

export class RateLimitError extends ServerError {
  constructor(message = "Too many requests", details?: Record<string, unknown>) {
    super(message, "RATE_LIMIT_ERROR", details);
    this.category = ErrorCategory.RATE_LIMIT;
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized", code = "AUTH_ERROR", details?: Record<string, unknown>) {
    super(message, code, details);
    this.category = ErrorCategory.AUTH;
  }
}

export class PermissionError extends AuthError {
  constructor(message = "Permission denied", details?: Record<string, unknown>) {
    super(message, "PERMISSION_ERROR", details);
    this.category = ErrorCategory.PERMISSION;
  }
}

export class CacheError extends AppError {
  constructor(message = "Cache error", details?: Record<string, unknown>) {
    super(message, "CACHE_ERROR", details);
    this.category = ErrorCategory.CACHE;
  }
}

export class SerializationError extends AppError {
  constructor(message = "Serialization error", details?: Record<string, unknown>) {
    super(message, "SERIALIZATION_ERROR", details);
    this.category = ErrorCategory.SERIALIZATION;
  }
}
