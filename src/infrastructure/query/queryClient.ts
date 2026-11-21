/** @format */

import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import type { Persister } from "@tanstack/react-query-persist-client";

import { getStorageSync } from "@/src/data/cache/mmkvStorage";
import { log } from "@/src/infrastructure/logging/logger";

export interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const QUERY_CACHE_KEY = "CHAT_ROULETTE_OFFLINE_QUERY_CACHE";
export const DEFAULT_STALE_TIME = 5 * 60 * 1000;
export const DEFAULT_GC_TIME = 24 * 60 * 60 * 1000;

export const clientAsyncStorage: AsyncStorage = {
  getItem: (key: string) => {
    try {
      return Promise.resolve(getStorageSync().getString(key) ?? null);
    } catch (e) {
      log.warn("[QueryClient] Failed to read from MMKV storage:", e);
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      getStorageSync().setString(key, value);
      return Promise.resolve();
    } catch (e) {
      log.warn("[QueryClient] Failed to write to MMKV storage:", e);
      return Promise.resolve();
    }
  },
  removeItem: (key: string) => {
    try {
      getStorageSync().delete(key);
      return Promise.resolve();
    } catch (e) {
      log.warn("[QueryClient] Failed to delete from MMKV storage:", e);
      return Promise.resolve();
    }
  },
};

export const queryPersister: Persister = createAsyncStoragePersister({
  storage: clientAsyncStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      networkMode: "offlineFirst",
      retry: (failureCount, error) => {
        const errObj = error as { name?: string; code?: string } | undefined;
        if (
          errObj?.name === "CanceledError" ||
          errObj?.name === "AbortError" ||
          errObj?.code === "ERR_CANCELED"
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: "online",
      retry: 1,
    },
  },
});

export function setupOnlineManager(): () => void {
  let removeListener: (() => void) | undefined;
  onlineManager.setEventListener((setOnline) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(isOnline);
    });
    removeListener = unsubscribe;
    return unsubscribe;
  });

  return () => {
    removeListener?.();
  };
}

setupOnlineManager();

export function clearQueryCache(): void {
  try {
    queryClient.clear();
    void queryPersister.removeClient();
  } catch (error) {
    log.warn("[QueryClient] Error clearing query cache:", error);
  }
}
