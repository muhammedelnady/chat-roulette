/** @format */
/**
 * Infrastructure Secure Storage
 */

import * as SecureStore from "expo-secure-store";

import { log } from "@/src/infrastructure/logging/logger";

const KEY_REGISTRY = "app_key_registry";

const registerKey = async (key: string): Promise<void> => {
  if (key === KEY_REGISTRY) return;
  const stored = await SecureStore.getItemAsync(KEY_REGISTRY);
  const keys: string[] = stored ? (JSON.parse(stored) as string[]) : [];
  if (!keys.includes(key)) {
    keys.push(key);
    await SecureStore.setItemAsync(KEY_REGISTRY, JSON.stringify(keys));
  }
};

const unregisterKey = async (key: string): Promise<void> => {
  if (key === KEY_REGISTRY) return;
  const stored = await SecureStore.getItemAsync(KEY_REGISTRY);
  if (!stored) return;
  const keys: string[] = JSON.parse(stored) as string[];
  const filtered = keys.filter((k) => k !== key);
  if (filtered.length === 0) {
    await SecureStore.deleteItemAsync(KEY_REGISTRY);
  } else {
    await SecureStore.setItemAsync(KEY_REGISTRY, JSON.stringify(filtered));
  }
};

export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await SecureStore.setItemAsync(key, jsonValue);
    await registerKey(key);
  } catch (error) {
    log.error(`Failed to save data to secure storage: ${key}`, error);
    throw error;
  }
};

export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await SecureStore.getItemAsync(key);
    if (jsonValue === null) {
      return null;
    }
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    log.error(`Failed to get data from secure storage: ${key}`, error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
    await unregisterKey(key);
  } catch (error) {
    log.error(`Failed to remove data from secure storage: ${key}`, error);
    throw error;
  }
};

export const clearAll = async (): Promise<void> => {
  try {
    const stored = await SecureStore.getItemAsync(KEY_REGISTRY);
    if (!stored) return;
    const keys: string[] = JSON.parse(stored) as string[];
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
    await SecureStore.deleteItemAsync(KEY_REGISTRY);
  } catch (error) {
    log.error("Failed to clear secure storage", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};
