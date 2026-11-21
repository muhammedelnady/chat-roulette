/** @format */

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

export const shadows: ShadowTokens = {
  none: createShadow(0, 0, 0, 0),
  sm: createShadow(1, 0.08, 2, 1),
  md: createShadow(2, 0.14, 6, 3),
  lg: createShadow(4, 0.2, 10, 6),
  xl: createShadow(8, 0.28, 16, 12),
};

export const lightShadows = shadows;

export const darkShadows: ShadowTokens = {
  none: createShadow(0, 0, 0, 0),
  sm: createShadow(1, 0.3, 3, 2),
  md: createShadow(2, 0.4, 8, 4),
  lg: createShadow(4, 0.5, 12, 8),
  xl: createShadow(6, 0.6, 16, 12),
};
