/** @format */

import { borderRadius } from "./border-radius";
import { darkColors, lightColors } from "./colors";
import { darkShadows, lightShadows } from "./shadows";
import { spacing } from "./spacing";
import type { ColorTokens, Theme, ThemeMode } from "./types";
import { typography } from "./typography";
import { zIndex } from "./z-index";

export const createTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: mode === "light" ? lightColors : darkColors,
  typography,
  spacing,
  shadows: mode === "light" ? lightShadows : darkShadows,
  borderRadius,
  zIndex,
});

export const lightTheme = createTheme("light");
export const darkTheme = createTheme("dark");

export const getColors = (mode: ThemeMode): ColorTokens =>
  mode === "light" ? lightColors : darkColors;

export { borderRadius } from "./border-radius";
export { colors, commonColors, darkColors, gradients, lightColors, primitives } from "./colors";
export { darkShadows, lightShadows, shadows } from "./shadows";
export {
  CSS_EASE_IN_OUT,
  CSS_EASE_OUT,
  EASE_IN_OUT,
  EASE_OUT,
  EASE_SHEET,
  FADE_DOWN_ENTER,
  FADE_DOWN_EXIT,
  FADE_ENTER,
  FADE_EXIT,
  FADE_UP_ENTER,
  FADE_UP_EXIT,
  LIST_ITEM_REFLOW,
  MATCH_REVEAL_ENTER,
  MATCH_REVEAL_EXIT,
  MATCH_STAGGER_1,
  MATCH_STAGGER_2,
  MATCH_STAGGER_3,
  MOTION_DURATION,
  MOTION_SPRING,
  projectVelocity,
  REACTION_CAPSULE_ENTER,
  REACTION_CAPSULE_EXIT,
  rubberband,
  SOFT_POP_ENTER,
  SOFT_POP_EXIT,
} from "./motion";
export { spacing } from "./spacing";
export {
  COMPONENT_HEIGHTS,
  createButtonAccessibilityProps,
  createHitSlop,
  HIT_SLOP,
} from "./style-utils";
export type {
  BorderRadiusKey,
  BorderRadiusTokens,
  ButtonSize,
  ButtonVariant,
  ColorKey,
  ColorTokens,
  FontSizeKey,
  FontWeightKey,
  ShadowKey,
  ShadowStyle,
  ShadowTokens,
  SpacingKey,
  SpacingTokens,
  TextStyleFragment,
  TextVariant,
  TextWeight,
  Theme,
  ThemeMode,
  TypographyTokens,
  ZIndexKey,
  ZIndexTokens,
} from "./types";
export { typography } from "./typography";
export { zIndex } from "./z-index";
