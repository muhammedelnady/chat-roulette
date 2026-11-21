/** @format */
/**
 * Data Cache Envelope
 */

export interface CacheEnvelope<T> {
  readonly version: number;
  readonly cachedAt: number;
  readonly ttlMs: number;
  readonly data: T;
  readonly etag?: string;
}

export const CACHE_ENVELOPE_VERSION = 1;
