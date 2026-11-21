/** @format */
/**
 * Infrastructure Storage Zustand MMKV Adapter
 */

import type { StateStorage } from "zustand/middleware";

import { getStorageSync } from "@/src/infrastructure/storage/mmkvStorage";

export const zustandMMKVStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    try {
      getStorageSync().setString(name, value);
    } catch {}
  },

  getItem: (name: string): string | null => {
    try {
      return getStorageSync().getString(name) ?? null;
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
