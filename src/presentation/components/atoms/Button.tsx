/** @format */

import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useMemo } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { getHapticsService } from "@/src/di/registerHaptics";
import { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";
import { useUI } from "@/src/presentation/hooks";
import { borderRadius, spacing } from "@theme";
import { COMPONENT_HEIGHTS, createButtonAccessibilityProps } from "@theme/style-utils";
import type { ButtonSize, ButtonVariant, ColorTokens, TextVariant } from "@theme/types";

import { AnimatedPressable, type AnimatedPressableProps } from "./AnimatedPressable";
import { Text } from "./Text";

export interface ButtonProps extends Omit<
  AnimatedPressableProps,
  "style" | "children" | "disabled" | "hitSlop" | "accessibilityRole" | "accessibilityLabel"
> {
  readonly label: string;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly icon?: React.ReactNode;
  readonly iconPosition?: "start" | "end";
  readonly gradient?: boolean | readonly [string, string, ...string[]];
  readonly textColor?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
}

interface StyleConfig {
  readonly variant: ButtonVariant;
  readonly size: ButtonSize;
  readonly disabled: boolean;
  readonly hasGradient: boolean;
  readonly colors: ColorTokens;
}

const getTextVariant = (size: ButtonSize): TextVariant => {
  switch (size) {
    case "sm":
      return "sm";
    case "md":
      return "md";
    case "lg":
      return "lg";
  }
};

const getBackgroundColor = (
  variant: ButtonVariant,
  disabled: boolean,
  hasGradient: boolean,
  colors: ColorTokens
): string => {
  if (hasGradient && !disabled) return "transparent";
  if (disabled) return colors.background;

  switch (variant) {
    case "primary":
      return colors.primary;
    case "secondary":
      return colors.accent;
    case "outline":
    case "ghost":
      return "transparent";
  }
};

const getTextColor = (variant: ButtonVariant, disabled: boolean, colors: ColorTokens): string => {
  if (disabled) return colors.textSecondary;

  switch (variant) {
    case "primary":
    case "secondary":
      return colors.textOnPrimary;
    case "outline":
      return colors.primary;
    case "ghost":
      return colors.textPrimary;
  }
};

const getBorderColor = (variant: ButtonVariant, disabled: boolean, colors: ColorTokens): string => {
  if (variant === "outline") {
    return disabled ? colors.border : colors.primary;
  }
  return "transparent";
};

const buildContainerStyle = (config: StyleConfig): ViewStyle => {
  const { variant, size, disabled, hasGradient, colors } = config;

  return {
    backgroundColor: getBackgroundColor(variant, disabled, hasGradient, colors),
    borderColor: getBorderColor(variant, disabled, colors),
    borderWidth: variant === "outline" ? 1 : 0,
    height: COMPONENT_HEIGHTS.button[size],
    borderRadius: borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled && variant !== "outline" ? 0.7 : 1,
    overflow: "hidden",
  };
};

export const Button = memo<ButtonProps>(
  ({
    label,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon,
    iconPosition = "start",
    style,
    containerStyle,
    textStyle,
    gradient,
    textColor,
    accessibilityLabel,
    accessibilityHint,
    onPress,
    testID = "button-touchable",
    ...props
  }) => {
    const { colors } = useUI();
    const hasGradient = Boolean(gradient) && !disabled;

    const containerStyles = useMemo(
      () =>
        buildContainerStyle({
          variant,
          size,
          disabled,
          hasGradient,
          colors,
        }),
      [variant, size, disabled, hasGradient, colors]
    );

    const resolvedTextColor = useMemo(
      () => textColor ?? getTextColor(variant, disabled, colors),
      [textColor, variant, disabled, colors]
    );

    const textVariant = getTextVariant(size);

    const gradientColors = useMemo((): readonly [string, string, ...string[]] => {
      if (Array.isArray(gradient)) {
        return gradient as readonly [string, string, ...string[]];
      }
      return [colors.primary, colors.accent] as const;
    }, [gradient, colors.primary, colors.accent]);

    const accessibilityProps = useMemo(
      () =>
        createButtonAccessibilityProps({
          label: accessibilityLabel ?? label,
          disabled,
          loading,
          hint: accessibilityHint,
        }),
      [accessibilityLabel, label, disabled, loading, accessibilityHint]
    );

    const handlePress = useCallback(() => {
      if (!disabled && !loading && onPress) {
        onPress();
      }
    }, [disabled, loading, onPress]);

    const iconElement = icon ? <View style={styles.iconContainer}>{icon}</View> : null;

    const content = (
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={resolvedTextColor} />
        ) : (
          <View style={styles.innerContent}>
            {iconPosition === "start" && iconElement}
            <Text variant={textVariant} weight="medium" color={resolvedTextColor} style={textStyle}>
              {label}
            </Text>
            {iconPosition === "end" && iconElement}
          </View>
        )}
      </View>
    );

    const onHaptic = useCallback(async () => {
      await getHapticsService().light();
    }, []);

    const pressableStyle = useMemo(
      () => [containerStyles, containerStyle, style],
      [containerStyles, containerStyle, style]
    );

    return (
      <AnimatedPressable
        style={pressableStyle}
        disabled={disabled || loading}
        hapticType={HapticFeedbackType.Light}
        onHaptic={onHaptic}
        onPress={handlePress}
        {...props}
        {...accessibilityProps}
        accessibilityRole="button"
        testID={testID}
      >
        {hasGradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientFill}
          >
            {content}
          </LinearGradient>
        ) : (
          content
        )}
      </AnimatedPressable>
    );
  }
);

Button.displayName = "Button";

const styles = StyleSheet.create({
  gradientFill: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  innerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: spacing[16],
  },
  iconContainer: {
    marginHorizontal: spacing[8],
  },
});
