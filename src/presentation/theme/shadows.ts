/** @format */

import { primitives } from "./colors";
import type { ShadowStyle, ShadowTokens } from "./types";

const createShadow = (
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number
): ShadowStyle => ({
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

const createTintedShadow = (
  shadowColor: string,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number
): ShadowStyle => ({
  shadowColor,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const shadows: ShadowTokens = {
  none: createShadow(0, 0, 0, 0),
  sm: createShadow(1, 0.08, 3, 1),
  md: createShadow(3, 0.14, 8, 3),
  lg: createShadow(6, 0.2, 14, 6),
  xl: createShadow(10, 0.28, 20, 12),
  glowPrimary: createTintedShadow(primitives.violet600, 6, 0.28, 14, 8),
  glowAccent: createTintedShadow(primitives.cyan600, 4, 0.24, 12, 6),
};

export const lightShadows = shadows;

export const darkShadows: ShadowTokens = {
  none: createShadow(0, 0, 0, 0),
  sm: createShadow(2, 0.32, 4, 2),
  md: createShadow(4, 0.42, 10, 4),
  lg: createShadow(6, 0.52, 16, 8),
  xl: createShadow(10, 0.62, 22, 12),
  glowPrimary: createTintedShadow(primitives.violet500, 6, 0.42, 16, 8),
  glowAccent: createTintedShadow(primitives.cyan400, 4, 0.36, 14, 6),
};
