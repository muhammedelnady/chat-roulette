/** @format */

export function getFirstChar(value: string, fallback = "?"): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const chars = Array.from(trimmed);
  return (chars[0] ?? fallback).toUpperCase();
}

export function getInitials(value: string, fallback = "CR"): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const first = Array.from(parts[0] ?? "")[0];
    return (first ?? fallback).toUpperCase();
  }
  const first = Array.from(parts[0] ?? "")[0] ?? "";
  const last = Array.from(parts[parts.length - 1] ?? "")[0] ?? "";
  const combined = `${first}${last}`.toUpperCase();
  return combined || fallback;
}
