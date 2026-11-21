/** @format */

import {
  create,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import type { ITokensStorage } from "@/src/domain/repositories";
import { isOk } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";
import { getStorageSync } from "@/src/infrastructure/storage/mmkvStorage";
import { env } from "@/src/infrastructure/system/env";

const instance = create({
  baseURL: env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retriedAfterRefresh?: boolean;
}

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function isSameApiOrigin(
  requestUrl?: string,
  baseUrl: string = env.EXPO_PUBLIC_API_URL
): boolean {
  if (!requestUrl) return true;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(requestUrl) && !requestUrl.startsWith("//")) {
    return true;
  }
  try {
    const parsedRequest = new URL(requestUrl);
    const parsedBase = new URL(baseUrl);
    return parsedRequest.origin === parsedBase.origin;
  } catch {
    return false;
  }
}

async function readAccessToken(tokenStorage: ITokensStorage): Promise<string | null> {
  try {
    if (typeof tokenStorage.getToken === "function") {
      return await tokenStorage.getToken();
    }
    const tokensRes = await tokenStorage.getTokens();
    return isOk(tokensRes) ? tokensRes.value.accessToken : null;
  } catch (error) {
    log.warn("[HttpClient] Failed to read access token:", error);
    return null;
  }
}

async function refreshAccessToken(tokenStorage: ITokensStorage): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const tokensRes = await tokenStorage.getTokens();
      const refreshToken = isOk(tokensRes) ? tokensRes.value.refreshToken : null;
      if (!refreshToken) {
        await tokenStorage.clearTokens();
        return null;
      }

      const response = await instance.post<{
        data?: { accessToken?: string; refreshToken?: string };
        accessToken?: string;
        refreshToken?: string;
      }>("/api/v1/auth/refresh", { refreshToken });

      const payload = response.data.data ?? response.data;
      const nextAccess = payload.accessToken;
      const nextRefresh = payload.refreshToken ?? refreshToken;
      if (typeof nextAccess !== "string" || !nextAccess) {
        await tokenStorage.clearTokens();
        return null;
      }

      await tokenStorage.saveTokens(nextAccess, nextRefresh);
      return nextAccess;
    } catch (error) {
      log.warn("[HttpClient] Token refresh failed:", error);
      await tokenStorage.clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function resetHttpAuth(): void {
  if (requestInterceptorId !== null) {
    instance.interceptors.request.eject(requestInterceptorId);
    requestInterceptorId = null;
  }
  if (responseInterceptorId !== null) {
    instance.interceptors.response.eject(responseInterceptorId);
    responseInterceptorId = null;
  }
  refreshPromise = null;
}

export function configureHttpAuth(tokenStorage: ITokensStorage): () => void {
  if (requestInterceptorId !== null || responseInterceptorId !== null) {
    return resetHttpAuth;
  }

  requestInterceptorId = instance.interceptors.request.use(async (config) => {
    if (!isSameApiOrigin(config.url, config.baseURL ?? env.EXPO_PUBLIC_API_URL)) {
      return config;
    }

    const token = await readAccessToken(tokenStorage);

    let guestId: string | undefined;
    try {
      guestId = getStorageSync().getString("@chat_guest_session_id");
    } catch (error) {
      log.warn("[HttpClient] Failed to read guest session ID:", error);
      guestId = undefined;
    }

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    if (guestId) {
      config.headers.set("X-Guest-Session-Id", guestId);
    }

    return config;
  });

  responseInterceptorId = instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retriedAfterRefresh &&
        !originalRequest.url?.includes("/auth/refresh") &&
        isSameApiOrigin(originalRequest.url, originalRequest.baseURL ?? env.EXPO_PUBLIC_API_URL)
      ) {
        originalRequest._retriedAfterRefresh = true;
        const nextToken = await refreshAccessToken(tokenStorage);
        if (nextToken) {
          originalRequest.headers.set("Authorization", `Bearer ${nextToken}`);
          return instance.request(originalRequest);
        }
      }
      return Promise.reject(error);
    }
  );

  return resetHttpAuth;
}

export const httpClientInstance = instance;

export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.get<T>(url, config);
    return response.data;
  },
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.post<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await instance.delete<T>(url, config);
    return response.data;
  },
};
