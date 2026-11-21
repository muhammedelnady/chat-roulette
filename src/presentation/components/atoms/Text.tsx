/** @format */

import { memo, useMemo } from "react";
import type { TextProps as RNTextProps, StyleProp, TextStyle } from "react-native";
import { Text as RNText } from "react-native";

import { useUI } from "@/src/presentation/hooks";
import type { ColorKey, TextVariant, TextWeight, TypographyTokens } from "@theme/types";

export interface TextProps extends RNTextProps {
  readonly variant?: TextVariant;
  readonly weight?: TextWeight;
  readonly color?: string;
  readonly colorKey?: ColorKey;
  readonly centered?: boolean;
  readonly style?: StyleProp<TextStyle>;
  readonly children?: React.ReactNode;
}

const getLineHeightMultiplier = (
  variant: TextVariant,
  lineHeights: TypographyTokens["lineHeight"]
): number => {
  switch (variant) {
    case "xs":
    case "sm":
      return lineHeights.tight;
    case "base":
    case "md":
    case "lg":
      return lineHeights.normal;
    case "xl":
    case "2xl":
    case "3xl":
    case "4xl":
      return lineHeights.relaxed;
  }
};

export const Text = memo<TextProps>(
  ({
    children,
    style,
    variant = "md",
    weight = "regular",
    color,
    colorKey,
    centered,
    accessibilityRole = "text",
    ...props
  }) => {
    const { colors, typography, direction, getColor } = useUI();
    const textStyle = useMemo<TextStyle>(() => {
      const resolvedColor = color ?? (colorKey ? getColor(colorKey) : colors.textPrimary);

      return {
        fontFamily: typography.fontFamily[weight],
        fontSize: typography.fontSize[variant],
        lineHeight:
          typography.fontSize[variant] * getLineHeightMultiplier(variant, typography.lineHeight),
        color: resolvedColor,
        writingDirection: direction as TextStyle["writingDirection"],
        textAlign: centered ? "center" : direction === "rtl" ? "right" : "left",
      };
    }, [
      color,
      colorKey,
      getColor,
      colors.textPrimary,
      typography.fontFamily,
      typography.fontSize,
      typography.lineHeight,
      weight,
      variant,
      direction,
      centered,
    ]);

    return (
      <RNText
        accessible
        accessibilityRole={accessibilityRole}
        style={[textStyle, style]}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = "Text";
