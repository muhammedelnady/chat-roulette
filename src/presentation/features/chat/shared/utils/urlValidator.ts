/** @format */

import { env, isSimulatedChatMode } from "@/src/infrastructure/system/env";

const IMAGE_EXT_REGEX = /\.(jpe?g|png|webp|gif)$/i;

function resolveRelativeUrl(url: string): string | null {
  if (!url.startsWith("/") || url.startsWith("//")) return null;
  const baseUrl = env.EXPO_PUBLIC_API_URL.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
  if (!baseUrl.startsWith("https://") && !baseUrl.startsWith("http://")) {
    return null;
  }
  return `${baseUrl}${url}`;
}

export function isSafeMediaUrl(url: string, options: { allowLocal?: boolean } = {}): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("//")) return false;

  if (trimmed.startsWith("/")) {
    return resolveRelativeUrl(trimmed) !== null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:") return true;
    if (parsed.protocol === "simulated:" && isSimulatedChatMode) return true;
    if (options.allowLocal && (parsed.protocol === "file:" || parsed.protocol === "content:")) {
      return true;
    }
    if (parsed.protocol === "http:" && !isSimulatedChatMode) {
      const apiOrigin = new URL(env.EXPO_PUBLIC_API_URL).origin;
      return parsed.origin === apiOrigin;
    }
    return false;
  } catch {
    return false;
  }
}

export function resolveSafeMediaUrl(url: string, options: { allowLocal?: boolean } = {}): string {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("//")) return "";
  if (trimmed.startsWith("/")) {
    return resolveRelativeUrl(trimmed) ?? "";
  }
  return isSafeMediaUrl(trimmed, options) ? trimmed : "";
}

export function isPreviewableImageUrl(url: string, mimeType = ""): boolean {
  const resolved = resolveSafeMediaUrl(url, { allowLocal: true });
  if (!resolved) return false;
  if (mimeType.startsWith("image/")) return true;
  try {
    const parsed = new URL(resolved);
    return IMAGE_EXT_REGEX.test(parsed.pathname);
  } catch {
    return IMAGE_EXT_REGEX.test(resolved.split("?")[0] ?? "");
  }
}
