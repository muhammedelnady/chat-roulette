/** @format */
/**
 * Data TTL Cache Manager
 */

import { getStorageSync } from "@/src/data/cache/mmkvStorage";
import {
  CACHE_ENVELOPE_VERSION,
  type CacheEnvelopeEntity,
} from "@/src/domain/entities/CacheEnvelopeEntity";
import type { IKeyValueStorage } from "@/src/domain/repositories/IKeyValueStorage";

export class TtlCacheManager {
  constructor(private readonly storage: IKeyValueStorage = getStorageSync()) {}

  getEnvelope<T>(key: string): CacheEnvelopeEntity<T> | null {
    try {
      const raw = this.storage.getString(key);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !("version" in parsed) ||
        (parsed as { version?: unknown }).version !== CACHE_ENVELOPE_VERSION
      ) {
        return null;
      }
      return parsed as CacheEnvelopeEntity<T>;
    } catch {
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
    try {
      const envelope: CacheEnvelopeEntity<T> = {
        version: CACHE_ENVELOPE_VERSION,
        cachedAt: Date.now(),
        ttlMs,
        data,
        ...(etag ? { etag } : {}),
      };
      this.storage.setString(key, JSON.stringify(envelope));
    } catch {}
  }

  delete(key: string): void {
    try {
      this.storage.delete(key);
    } catch {}
  }

  invalidatePrefix(prefix: string): number {
    try {
      const keys = this.storage.getAllKeys().filter((k) => k.startsWith(prefix));
      for (const k of keys) {
        this.storage.delete(k);
      }
      return keys.length;
    } catch {
      return 0;
    }
  }
}

export const ttlCacheManager = new TtlCacheManager();
