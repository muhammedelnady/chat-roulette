/** @format */
/**
 * Data TTL Cache Manager
 */

import type { IKeyValueStorage } from "@/src/domain/repositories/IKeyValueStorage";
import { log } from "@/src/infrastructure/logging/logger";
import { getStorageSync } from "@/src/infrastructure/storage/mmkvStorage";

import { CACHE_ENVELOPE_VERSION, type CacheEnvelope } from "./CacheEnvelope";

const CACHE_KEY_PREFIX = "ttl:";
const MAX_CACHE_ENTRIES = 200;

function prefixKey(key: string): string {
  return key.startsWith(CACHE_KEY_PREFIX) ? key : `${CACHE_KEY_PREFIX}${key}`;
}

function isValidEnvelope(raw: unknown): raw is CacheEnvelope<unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const obj = raw as Record<string, unknown>;
  return (
    obj["version"] === CACHE_ENVELOPE_VERSION &&
    typeof obj["cachedAt"] === "number" &&
    Number.isFinite(obj["cachedAt"]) &&
    typeof obj["ttlMs"] === "number" &&
    Number.isFinite(obj["ttlMs"]) &&
    "data" in obj
  );
}

export class TtlCacheManager {
  constructor(private readonly storage: IKeyValueStorage = getStorageSync()) {}

  getEnvelope<T>(key: string): CacheEnvelope<T> | null {
    const storageKey = prefixKey(key);
    try {
      const raw = this.storage.getString(storageKey);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!isValidEnvelope(parsed)) {
        this.storage.delete(storageKey);
        return null;
      }
      return parsed as CacheEnvelope<T>;
    } catch {
      this.storage.delete(storageKey);
      return null;
    }
  }

  getFresh<T>(key: string, now: number = Date.now()): T | null {
    const envelope = this.getEnvelope<T>(key);
    if (!envelope) return null;
    if (envelope.ttlMs <= 0) return envelope.data;
    if (envelope.cachedAt + envelope.ttlMs > now) {
      return envelope.data;
    }
    return null;
  }

  getStaleFallback<T>(key: string): T | null {
    const envelope = this.getEnvelope<T>(key);
    if (!envelope) return null;
    return envelope.data;
  }

  set<T>(key: string, data: T, ttlMs: number = 0, etag?: string): void {
    const storageKey = prefixKey(key);
    try {
      this.enforceCapacity(storageKey);
      const envelope: CacheEnvelope<T> = {
        version: CACHE_ENVELOPE_VERSION,
        cachedAt: Date.now(),
        ttlMs,
        data,
        ...(etag ? { etag } : {}),
      };
      this.storage.setString(storageKey, JSON.stringify(envelope));
    } catch (error) {
      log.warn(`[TtlCacheManager] Failed to persist cache key ${storageKey}:`, error);
    }
  }

  delete(key: string): void {
    try {
      this.storage.delete(prefixKey(key));
    } catch (error) {
      log.warn(`[TtlCacheManager] Failed to delete cache key ${key}:`, error);
    }
  }

  invalidatePrefix(prefix: string): number {
    const fullPrefix = prefixKey(prefix);
    try {
      const keys = this.storage.getAllKeys().filter((k) => k.startsWith(fullPrefix));
      for (const k of keys) {
        this.storage.delete(k);
      }
      return keys.length;
    } catch (error) {
      log.warn(`[TtlCacheManager] Failed to invalidate prefix ${prefix}:`, error);
      return 0;
    }
  }

  private enforceCapacity(incomingKey: string): void {
    if (this.storage.contains(incomingKey)) return;
    const cacheKeys = this.storage.getAllKeys().filter((k) => k.startsWith(CACHE_KEY_PREFIX));
    if (cacheKeys.length < MAX_CACHE_ENTRIES) return;
    let oldestKey = cacheKeys[0];
    let oldestTs = Infinity;
    for (const k of cacheKeys) {
      const env = this.getEnvelope(k);
      const ts = env?.cachedAt ?? 0;
      if (ts < oldestTs) {
        oldestTs = ts;
        oldestKey = k;
      }
    }
    if (oldestKey) {
      this.storage.delete(oldestKey);
    }
  }
}

export const ttlCacheManager = new TtlCacheManager();
