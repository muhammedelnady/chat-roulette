/** @format */

import { useMemo } from "react";

import { useDirectionStore } from "@stores/useDirectionStore";
import { useLanguageStore } from "@stores/useLanguageStore";

import { useT } from "./useT";

export function useI18n() {
  const t = useT();
  const direction = useDirectionStore((s) => s.direction);
  const languageTag = useLanguageStore((s) => s.languageTag);

  return useMemo(
    () => ({
      t,
      isRTL: direction === "rtl",
      currentLanguage: languageTag,
    }),
    [t, direction, languageTag]
  );
}
