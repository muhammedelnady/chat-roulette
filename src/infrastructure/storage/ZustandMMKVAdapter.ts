/** @format */
/**
 * Infrastructure Storage Zustand MMKV Adapter
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

import {
  getStorageSync,
  isUsingFallbackStorage,
  primeFallbackStorage,
} from "@/src/data/cache/mmkvStorage";

export const zustandMMKVStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    try {
      getStorageSync().setString(name, value);
    } catch {}
  },

  getItem: (name: string): string | null | Promise<string | null> => {
    try {
      const syncVal = getStorageSync().getString(name);
      if (syncVal !== undefined) {
        return syncVal;
      }
      if (isUsingFallbackStorage()) {
        return AsyncStorage.getItem(name)
          .then((asyncVal) => {
            const latestSyncVal = getStorageSync().getString(name);
            if (latestSyncVal !== undefined) {
              return latestSyncVal;
            }
            if (asyncVal !== null) {
              primeFallbackStorage(name, asyncVal);
            }
            return asyncVal;
          })
          .catch(() => null);
      }
      return null;
    } catch {
      return null;
    }
  },

  removeItem: (name: string) => {
    try {
      getStorageSync().delete(name);
    } catch {}
  },
};
