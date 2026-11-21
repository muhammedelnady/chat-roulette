/** @format */

import type { Insets } from "react-native";

export const createHitSlop = (size: number): Insets => ({
  top: size,
  right: size,
  bottom: size,
  left: size,
});

export const HIT_SLOP = {
  sm: createHitSlop(8),
  md: createHitSlop(12),
  lg: createHitSlop(16),
} as const;

export const COMPONENT_HEIGHTS = {
  button: {
    sm: 36,
    md: 48,
    lg: 56,
  },
  input: {
    sm: 40,
    md: 48,
    lg: 56,
  },
} as const;

export const createButtonAccessibilityProps = (options: {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
}) => ({
  accessible: true,
  accessibilityRole: "button" as const,
  accessibilityLabel: options.label,
  accessibilityHint: options.hint,
  accessibilityState: {
    disabled: options.disabled ?? false,
    busy: options.loading ?? false,
  },
});
