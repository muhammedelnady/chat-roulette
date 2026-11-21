/** @format */

import { zustandMMKVStorage } from "@/src/infrastructure/storage/ZustandMMKVAdapter";

export async function readPersistedField(key: string, field: string): Promise<unknown> {
  try {
    const raw = await zustandMMKVStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    return parsed.state?.[field];
  } catch {
    return undefined;
  }
}
