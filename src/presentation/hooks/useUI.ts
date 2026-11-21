/** @format */

import { useMemo } from "react";

import { useThemeStore } from "@stores/useThemeStore";
import { darkTheme, lightTheme } from "@theme";
import type {
  BorderRadiusTokens,
  ColorKey,
  ColorTokens,
  ShadowTokens,
  SpacingTokens,
  TypographyTokens,
} from "@theme/types";

import { useI18n } from "./useI18n";
import { useRTL } from "./useRTL";

export interface UseUIReturn {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
  isDark: boolean;
  colorScheme: "light" | "dark";
  toggleTheme: () => void;
  t: ReturnType<typeof useI18n>["t"];
  currentLanguage: string;
  isRTL: boolean;
  direction: string;
  textAlign: string;
  getColor: (colorKey: ColorKey) => string;
}

export function useUI(): UseUIReturn {
  const mode = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = mode === "dark" ? darkTheme : lightTheme;

  const { t, isRTL, currentLanguage } = useI18n();
  const { direction, textAlign } = useRTL();

  return useMemo(
    () => ({
      colors: theme.colors,
      spacing: theme.spacing,
      typography: theme.typography,
      shadows: theme.shadows,
      borderRadius: theme.borderRadius,
      isDark: mode === "dark",
      colorScheme: mode,
      toggleTheme,
      t,
      currentLanguage,
      isRTL,
      direction,
      textAlign,
      getColor: (colorKey: ColorKey) => theme.colors[colorKey],
    }),
    [theme, t, isRTL, currentLanguage, direction, textAlign, mode, toggleTheme]
  );
}
