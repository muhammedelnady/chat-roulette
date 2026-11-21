/** @format */
/**
 * RFC4122 v4 UUID generator
 */

function bytesToUuid(bytes: Uint8Array): string {
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function getWebCrypto(): Partial<Crypto> | undefined {
  return globalThis.crypto;
}

export function generateUUID(): string {
  const webCrypto = getWebCrypto();
  if (typeof webCrypto?.randomUUID === "function") {
    try {
      const result = webCrypto.randomUUID();
      if (typeof result === "string" && result.length > 0) {
        return result;
      }
    } catch {}
  }

  if (typeof webCrypto?.getRandomValues === "function") {
    try {
      const bytes = new Uint8Array(16);
      webCrypto.getRandomValues(bytes);
      return bytesToUuid(bytes);
    } catch {}
  }

  const fallbackBytes = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) {
    fallbackBytes[i] = Math.floor(Math.random() * 256);
  }
  return bytesToUuid(fallbackBytes);
}
