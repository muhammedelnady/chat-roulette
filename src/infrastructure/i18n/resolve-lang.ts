/** @format */

import type { LangCode } from "./resources";
import { resources } from "./resources";

export function resolveLangCode(langTag?: string): LangCode {
  if (!langTag) return "en";
  const primary = langTag.replace("_", "-").toLowerCase().split("-")[0] ?? "";
  return primary in resources ? (primary as LangCode) : "en";
}
