/** @format */

import { resolveLangCode } from "./resolve-lang";
import { resources } from "./resources";
import type { TxKeyPath } from "./types";

export function translate(
  langTag: string,
  key: TxKeyPath,
  vars?: Record<string, string | number>
): string {
  const langCode = resolveLangCode(langTag);

  type NestedRecord = Record<string, unknown>;

  const getByPath = (obj: NestedRecord, path: string): unknown => {
    return path.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && Object.prototype.hasOwnProperty.call(acc, part)) {
        return (acc as NestedRecord)[part];
      }
      return undefined;
    }, obj);
  };

  const raw = getByPath(resources[langCode], key) ?? getByPath(resources.en, key) ?? key;

  let text: string = typeof raw === "string" ? raw : key;

  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replaceAll(`{${k}}`, String(v));
    });
  }

  return text;
}
