/** @format */
/**
 * Domain ITokens Storage
 */

import type { AppError } from "@/src/domain/errors";
import type { Result } from "@/src/domain/Result";

export interface ITokensStorage {
  getToken?(): Promise<string | null>;
  getTokens(): Promise<
    Result<{ accessToken: string | null; refreshToken: string | null }, AppError>
  >;
  saveTokens(accessToken: string, refreshToken: string): Promise<Result<void, AppError>>;
  clearTokens(): Promise<Result<void, AppError>>;
}
