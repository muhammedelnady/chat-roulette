/** @format */
/**
 * Infrastructure Token Storage Impl
 */

import * as SecureStore from "expo-secure-store";

import type { AppError } from "@/src/domain/errors";
import { ServerError } from "@/src/domain/errors";
import type { ITokensStorage } from "@/src/domain/repositories";
import { err, ok, type Result } from "@/src/domain/Result";
import { log } from "@infrastructure/logging/logger";

export const TOKEN_KEYS = {
  ACCESS_TOKEN: "chat_roulette_access_token",
  REFRESH_TOKEN: "chat_roulette_refresh_token",
} as const;

export class TokenStorageImpl implements ITokensStorage {
  async saveTokens(accessToken: string, refreshToken: string): Promise<Result<void, AppError>> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return ok(undefined);
    } catch (error) {
      log.error("Failed to save tokens to secure storage:", error);
      return err(
        new ServerError("Failed to save tokens", "TOKEN_SAVE_FAILED", {
          originalError: error,
        })
      );
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      log.error("[TokenStorageImpl] Error getting token:", error);
      return null;
    }
  }

  async getTokens(): Promise<
    Result<{ accessToken: string | null; refreshToken: string | null }, AppError>
  > {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      ]);
      return ok({ accessToken: accessToken ?? null, refreshToken: refreshToken ?? null });
    } catch (error) {
      log.error("Failed to retrieve tokens from secure storage:", error);
      return err(
        new ServerError("Failed to retrieve tokens", "TOKEN_READ_FAILED", {
          originalError: error,
        })
      );
    }
  }

  async clearTokens(): Promise<Result<void, AppError>> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      ]);
      return ok(undefined);
    } catch (error) {
      log.error("Failed to clear tokens from secure storage:", error);
      return err(
        new ServerError("Failed to clear tokens", "TOKEN_CLEAR_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
