/** @format */
/**
 * RFC4122 v4 UUID generator
 */

import * as Crypto from "expo-crypto";

export function generateUUID(): string {
  try {
    if (typeof Crypto.randomUUID === "function") {
      const result = Crypto.randomUUID();
      if (typeof result === "string" && result.length > 0) {
        return result;
      }
    }
  } catch {}

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      const result = crypto.randomUUID();
      if (typeof result === "string" && result.length > 0) {
        return result;
      }
    } catch {}
  }

  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  const numRandomBytes = (template.match(/[xy]/g) ?? []).length;
  const randomBytes = Crypto.getRandomBytes(numRandomBytes);

  let i = 0;
  return template.replace(/[xy]/g, (c) => {
    const randomByte = randomBytes[i++] ?? 0;
    const r = randomByte % 16;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
