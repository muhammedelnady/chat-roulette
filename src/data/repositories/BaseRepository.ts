/** @format */
/**
 * Data Base Repository
 */

import { ttlCacheManager, type TtlCacheManager } from "@/src/data/cache/TtlCacheManager";
import { log } from "@/src/data/utils/logger";
import { AppError, AuthError, RateLimitError, ServerError } from "@/src/domain/errors";
import type { IConnectivityChecker } from "@/src/domain/repositories";

export abstract class BaseRepository {
  constructor(
    protected readonly connectivityChecker?: IConnectivityChecker,
    protected readonly cacheManager: TtlCacheManager = ttlCacheManager
  ) {}

  protected handleError(error: unknown, context: string, errorCode?: string): AppError {
    if (error instanceof AppError) return error;
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    const errRecord = error as Record<string, unknown>;
    const response = errRecord["response"] as Record<string, unknown> | undefined;
    const details = errRecord["details"] as Record<string, unknown> | undefined;
    const status =
      typeof response?.["status"] === "number"
        ? response["status"]
        : typeof details?.["status"] === "number"
          ? details["status"]
          : undefined;

    const responseData = response?.["data"] as Record<string, unknown> | undefined;
    if (responseData) {
      log.warn(`[${context}] Server error response:`, JSON.stringify(responseData));
    }

    const serverErrorCode = responseData?.["errorCode"] as string | undefined;
    const serverMessage = responseData?.["message"] as string | undefined;
    const resolvedMessage = `${context}: ${serverMessage ?? message}`;

    if (status === 401) {
      return new AuthError(resolvedMessage, serverErrorCode ?? "UNAUTHORIZED");
    }
    if (status === 403) {
      return new AuthError(resolvedMessage, serverErrorCode ?? "FORBIDDEN");
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
