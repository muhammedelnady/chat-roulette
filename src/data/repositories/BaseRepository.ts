/** @format */
/**
 * Data Base Repository
 */

import { ttlCacheManager, type TtlCacheManager } from "@/src/data/cache/TtlCacheManager";
import {
  AppError,
  AuthError,
  DomainError,
  NetworkError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from "@/src/domain/errors";
import type { IConnectivityChecker } from "@/src/domain/repositories";
import { log } from "@/src/infrastructure/logging/logger";

function readStringField(
  record: Record<string, unknown> | undefined,
  key: string
): string | undefined {
  const val = record?.[key];
  if (typeof val === "string") return val;
  if (Array.isArray(val) && val.length > 0) {
    return val.map((v) => String(v)).join(", ");
  }
  return undefined;
}

export abstract class BaseRepository {
  constructor(
    protected readonly connectivityChecker?: IConnectivityChecker,
    protected readonly cacheManager: TtlCacheManager = ttlCacheManager
  ) {}

  protected handleError(error: unknown, context: string, errorCode?: string): AppError {
    if (error instanceof AppError) {
      return error;
    }
    if (error instanceof DomainError) {
      return new AppError(error.message, error.code, error.details, error.category);
    }

    const message = error instanceof Error ? error.message : "Unknown error occurred";
    const errRecord =
      typeof error === "object" && error !== null ? (error as Record<string, unknown>) : null;
    const axiosCode = typeof errRecord?.["code"] === "string" ? errRecord["code"] : undefined;

    if (axiosCode === "ECONNABORTED" || axiosCode === "ETIMEDOUT") {
      return new TimeoutError(`${context}: ${message}`, { code: axiosCode });
    }

    const response =
      typeof errRecord?.["response"] === "object" && errRecord["response"] !== null
        ? (errRecord["response"] as Record<string, unknown>)
        : undefined;
    const details =
      typeof errRecord?.["details"] === "object" && errRecord["details"] !== null
        ? (errRecord["details"] as Record<string, unknown>)
        : undefined;

    if (axiosCode === "ERR_NETWORK" || (!response && !details && Boolean(errRecord?.["request"]))) {
      return new NetworkError(`${context}: ${message}`, { code: axiosCode });
    }

    const status =
      typeof response?.["status"] === "number"
        ? response["status"]
        : typeof details?.["status"] === "number"
          ? details["status"]
          : undefined;

    const responseData =
      typeof response?.["data"] === "object" && response["data"] !== null
        ? (response["data"] as Record<string, unknown>)
        : undefined;

    const serverErrorCode = readStringField(responseData, "errorCode");
    const serverMessage = readStringField(responseData, "message");

    if (responseData) {
      log.warn(`[${context}] Server error response`, {
        status,
        errorCode: serverErrorCode,
        message: serverMessage,
      });
    }

    const resolvedMessage = `${context}: ${serverMessage ?? message}`;

    if (status === 400 || status === 422) {
      return new ValidationError(resolvedMessage, undefined, { status });
    }
    if (status === 401) {
      return new AuthError(resolvedMessage, serverErrorCode ?? "UNAUTHORIZED");
    }
    if (status === 403) {
      return new PermissionError(resolvedMessage, { status });
    }
    if (status === 404) {
      return new NotFoundError(context, { status });
    }
    if (status === 429) {
      return new RateLimitError(resolvedMessage, { status: 429 });
    }
    return new ServerError(resolvedMessage, serverErrorCode ?? errorCode ?? "SERVER_ERROR");
  }

  protected isOnline(): boolean {
    return this.connectivityChecker?.isConnected() ?? true;
  }
}
