/** @format */
/**
 * Data MMKV Storage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";

import type { IKeyValueStorage } from "@/src/domain/repositories/IKeyValueStorage";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

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
  createMMKV?: (config: unknown) => V4RawMMKV;
  MMKV?: new (config: unknown) => MMKVStorage;
}

let mmkvModule: MMKVModule | null = null;
let mmkvModuleLoaded = false;

async function loadMMKVModule(): Promise<MMKVModule | null> {
  if (mmkvModuleLoaded) return mmkvModule;
  if (isExpoGo) {
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

interface MMKVStorage {
  getString(key: string): string | undefined;
  setString(key: string, value: string): void;
  getNumber(key: string): number | undefined;
  setNumber(key: string, value: number): void;
  getBoolean(key: string): boolean | undefined;
  setBoolean(key: string, value: boolean): void;
  delete(key: string): void;
  clearAll(): void;
  getAllKeys(): string[];
  contains(key: string): boolean;
}

class MockStorage implements MMKVStorage {
  private map = new Map<string, string>();

  constructor() {
    this.hydrate();
  }

  private hydrate(): void {
    AsyncStorage.getAllKeys()
      .then((keys) => {
        if (keys.length === 0) return;
        AsyncStorage.multiGet(keys)
          .then((pairs) => {
            pairs.forEach(([k, v]) => {
              if (v !== null && !this.map.has(k)) {
                this.map.set(k, v);
              }
            });
          })
          .catch(() => {});
      })
      .catch(() => {});
  }

  getString(key: string): string | undefined {
    return this.map.get(key);
  }
  prime(key: string, value: string): void {
    if (!this.map.has(key)) {
      this.map.set(key, value);
    }
  }
  setString(key: string, value: string): void {
    this.map.set(key, value);
    AsyncStorage.setItem(key, value).catch(() => {});
  }
  getNumber(key: string): number | undefined {
    const val = this.map.get(key);
    return val !== undefined && val !== "" ? Number(val) : undefined;
  }
  setNumber(key: string, value: number): void {
    this.map.set(key, String(value));
    AsyncStorage.setItem(key, String(value)).catch(() => {});
  }
  getBoolean(key: string): boolean | undefined {
    const val = this.map.get(key);
    return val !== undefined && val !== "" ? val === "true" : undefined;
  }
  setBoolean(key: string, value: boolean): void {
    this.map.set(key, String(value));
    AsyncStorage.setItem(key, String(value)).catch(() => {});
  }
  delete(key: string): void {
    this.map.delete(key);
    AsyncStorage.removeItem(key).catch(() => {});
  }
  clearAll(): void {
    const keys = Array.from(this.map.keys());
    this.map.clear();
    if (keys.length > 0) {
      AsyncStorage.multiRemove(keys).catch(() => {});
    }
  }
  getAllKeys(): string[] {
    return Array.from(this.map.keys());
  }
  contains(key: string): boolean {
    return this.map.has(key);
  }
}

let storage: MMKVStorage | undefined;
let storageInitialized = false;
let storagePromise: Promise<MMKVStorage> | undefined;

function resolveEncryptionKey(): string {
  const key = process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY;
  if (key && key.trim() !== "") {
    return key;
  }
  return "chat_roulette_local_showcase_key_32c";
}

function instantiateMMKV(mmkvPkg: MMKVModule): MMKVStorage | null {
  const encryptionKey = resolveEncryptionKey();
  const mmkvConfig = {
    id: "chat-roulette-cache",
    encryptionKey,
  };

  if (typeof mmkvPkg.createMMKV === "function") {
    return createMMKVAdapter(mmkvPkg.createMMKV(mmkvConfig));
  }
  if (mmkvPkg.MMKV) {
    return new mmkvPkg.MMKV(mmkvConfig);
  }
  return null;
}

function initMMKVSync(): MMKVStorage | null {
  if (isExpoGo || process.env.NODE_ENV === "test") {
    return null;
  }
  if (mmkvModule) {
    return instantiateMMKV(mmkvModule);
  }
  return null;
}

function createMMKVAdapter(raw: V4RawMMKV): MMKVStorage {
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

async function createStorage(): Promise<MMKVStorage> {
  if (storage && storageInitialized) {
    return storage;
  }
  const syncMMKV = initMMKVSync();
  if (syncMMKV) {
    storage = syncMMKV;
    storageInitialized = true;
    return storage;
  }

  const mod = await loadMMKVModule();
  if (mod) {
    const inst = instantiateMMKV(mod);
    storage = inst ?? new MockStorage();
  } else {
    storage = new MockStorage();
  }

  storageInitialized = true;
  return storage;
}

async function initStorage(): Promise<MMKVStorage> {
  if (storageInitialized && storage) return storage;
  if (storagePromise) return storagePromise;

  storagePromise = createStorage();
  return storagePromise;
}

function getStorageSync(): MMKVStorage {
  if (storage) return storage;
  const syncMMKV = initMMKVSync();
  if (syncMMKV) {
    storage = syncMMKV;
    storageInitialized = true;
    return storage;
  }
  storage = new MockStorage();
  return storage;
}

export function isUsingFallbackStorage(): boolean {
  if (!storage) {
    getStorageSync();
  }
  return storage instanceof MockStorage;
}

export function primeFallbackStorage(key: string, value: string): void {
  if (storage instanceof MockStorage) {
    storage.prime(key, value);
  }
}

export { getStorageSync, initStorage };
export type { IKeyValueStorage as MMKVStorage };
