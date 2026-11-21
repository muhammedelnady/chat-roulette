/** @format */

import { useCallback } from "react";

import { translate } from "@/src/infrastructure/i18n/translate";
import type { TxKeyPath } from "@/src/infrastructure/i18n/types";
import { useLanguageStore } from "@stores/useLanguageStore";

export function useT() {
  const languageTag = useLanguageStore((s) => s.languageTag);

  return useCallback(
    (key: TxKeyPath, vars?: Record<string, string | number>) => translate(languageTag, key, vars),
    [languageTag]
  );
}
