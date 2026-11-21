/** @format */

export type Direction = "ltr" | "rtl";

const RTL_LANGS = new Set(["ar", "fa", "he", "ur", "ps", "dv", "ku", "ckb", "ug", "yi"]);

export function directionFromLangTag(langTag?: string): Direction {
  if (!langTag) return "ltr";
  const primary = langTag.replace("_", "-").toLowerCase().split("-")[0] ?? "";
  return RTL_LANGS.has(primary) ? "rtl" : "ltr";
}
