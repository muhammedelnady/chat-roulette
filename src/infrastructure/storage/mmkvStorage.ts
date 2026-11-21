/** @format */
/**
 * Infrastructure MMKV Storage
 */

import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import type { IKeyValueStorage } from "@/src/domain/repositories/IKeyValueStorage";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const MMKV_MASTER_KEY_ALIAS = "chat_roulette_mmkv_master_key_v1";

interface V4RawMMKV {
  set(key: string, value: boolean | string | number | ArrayBuffer): void;
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
  remove(key: string): boolean;
  clearAll(): void;
  getAllKeys(): string[];
  contains(key: string): boolean;
}

interface MMKVModule {
  createMMKV?: (config: {
    id: string;
    encryptionKey?: string;
    encryptionType?: "AES-128" | "AES-256";
  }) => V4RawMMKV;
}

type StoredValue = string | number | boolean;

class MockStorage implements IKeyValueStorage {
  private map = new Map<string, StoredValue>();

  getString(key: string): string | undefined {
    const val = this.map.get(key);
    return typeof val === "string" ? val : undefined;
  }

  prime(key: string, value: string): void {
    if (!this.map.has(key)) {
      this.map.set(key, value);
    }
  }

  setString(key: string, value: string): void {
    this.map.set(key, value);
  }

  getNumber(key: string): number | undefined {
    const val = this.map.get(key);
    if (typeof val === "number") {
      return Number.isFinite(val) ? val : undefined;
    }
    if (typeof val === "string" && val.trim() !== "") {
      const parsed = Number(val);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  setNumber(key: string, value: number): void {
    this.map.set(key, value);
  }

  getBoolean(key: string): boolean | undefined {
    const val = this.map.get(key);
    if (typeof val === "boolean") return val;
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }

  setBoolean(key: string, value: boolean): void {
    this.map.set(key, value);
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clearAll(): void {
    this.map.clear();
  }

  getAllKeys(): string[] {
    return Array.from(this.map.keys());
  }

  contains(key: string): boolean {
    return this.map.has(key);
  }

  entries(): [string, StoredValue][] {
    return Array.from(this.map.entries());
  }
}

let mmkvModule: MMKVModule | null = null;
let mmkvModuleLoaded = false;
let activeStorage: IKeyValueStorage = new MockStorage();
let storageInitialized = false;
let storagePromise: Promise<IKeyValueStorage> | undefined;

async function loadMMKVModule(): Promise<MMKVModule | null> {
  if (mmkvModuleLoaded) return mmkvModule;
  if (isExpoGo || process.env.NODE_ENV === "test") {
    mmkvModuleLoaded = true;
    return null;
  }
  try {
    const mod = (await import("react-native-mmkv")) as unknown as MMKVModule;
    mmkvModule = mod;
    mmkvModuleLoaded = true;
    return mod;
  } catch {
    mmkvModuleLoaded = true;
    return null;
  }
}

const storageProxy: IKeyValueStorage = {
  getString: (key) => activeStorage.getString(key),
  setString: (key, value) => {
    activeStorage.setString(key, value);
  },
  getNumber: (key) => activeStorage.getNumber(key),
  setNumber: (key, value) => {
    activeStorage.setNumber(key, value);
  },
  getBoolean: (key) => activeStorage.getBoolean(key),
  setBoolean: (key, value) => {
    activeStorage.setBoolean(key, value);
  },
  delete: (key) => {
    activeStorage.delete(key);
  },
  clearAll: () => {
    activeStorage.clearAll();
  },
  getAllKeys: () => activeStorage.getAllKeys(),
  contains: (key) => activeStorage.contains(key),
};

async function resolveEncryptionKeyAsync(): Promise<string | null> {
  try {
    const existing = await SecureStore.getItemAsync(MMKV_MASTER_KEY_ALIAS);
    if (existing && existing.length >= 32) {
      return existing;
    }
    const bytes = Crypto.getRandomBytes(16);
    const generated = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    await SecureStore.setItemAsync(MMKV_MASTER_KEY_ALIAS, generated, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return generated;
  } catch {
    return null;
  }
}

function createMMKVAdapter(raw: V4RawMMKV): IKeyValueStorage {
  return {
    getString: (key) => raw.getString(key),
    setString: (key, value) => {
      raw.set(key, value);
    },
    getNumber: (key) => raw.getNumber(key),
    setNumber: (key, value) => {
      raw.set(key, value);
    },
    getBoolean: (key) => raw.getBoolean(key),
    setBoolean: (key, value) => {
      raw.set(key, value);
    },
    delete: (key) => {
      raw.remove(key);
    },
    clearAll: () => raw.clearAll(),
    getAllKeys: () => raw.getAllKeys(),
    contains: (key) => raw.contains(key),
  };
}

function copyMockEntries(from: MockStorage, to: IKeyValueStorage): void {
  for (const [key, value] of from.entries()) {
    if (typeof value === "string") {
      to.setString(key, value);
    } else if (typeof value === "number") {
      to.setNumber(key, value);
    } else if (typeof value === "boolean") {
      to.setBoolean(key, value);
    }
  }
}

async function createStorage(): Promise<IKeyValueStorage> {
  if (storageInitialized) {
    return storageProxy;
  }

  try {
    const mod = await loadMMKVModule();
    if (mod?.createMMKV) {
      const encryptionKey = await resolveEncryptionKeyAsync();
      if (encryptionKey) {
        const raw = mod.createMMKV({
          id: "chat-roulette-cache",
          encryptionKey,
          encryptionType: "AES-256",
        });
        const inst = createMMKVAdapter(raw);
        if (activeStorage instanceof MockStorage) {
          copyMockEntries(activeStorage, inst);
        }
        activeStorage = inst;
      }
    }

    storageInitialized = true;
    return storageProxy;
  } catch (error) {
    storagePromise = undefined;
    throw error;
  }
}

async function initStorage(): Promise<IKeyValueStorage> {
  if (storageInitialized) return storageProxy;
  storagePromise ??= createStorage();
  return storagePromise;
}

function getStorageSync(): IKeyValueStorage {
  return storageProxy;
}

export function isUsingFallbackStorage(): boolean {
  return activeStorage instanceof MockStorage;
}

export function primeFallbackStorage(key: string, value: string): void {
  if (activeStorage instanceof MockStorage) {
    activeStorage.prime(key, value);
  }
}

export function resetStorageForTests(): void {
  mmkvModule = null;
  mmkvModuleLoaded = false;
  activeStorage = new MockStorage();
  storageInitialized = false;
  storagePromise = undefined;
}

export { getStorageSync, initStorage };
export type { IKeyValueStorage as MMKVStorage };
