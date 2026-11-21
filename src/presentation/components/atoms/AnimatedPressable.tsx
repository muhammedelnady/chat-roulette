/** @format */

import { memo, type ReactNode, useCallback, useMemo, useState } from "react";
import type {
  AccessibilityRole,
  AccessibilityState,
  Insets,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Pressable } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

import type { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";
import { CSS_EASE_OUT, MOTION_DURATION } from "@theme";

type PressableTransitionProperty = "transform" | "opacity" | "backgroundColor" | "borderColor";

export interface AnimatedPressableProps {
  readonly children?: ReactNode;
  readonly scaleTo?: number;
  readonly hapticType?: HapticFeedbackType | null;
  readonly onPress?: () => void;
  readonly onLongPress?: () => void;
  readonly onHaptic?: (type: HapticFeedbackType) => Promise<void>;
  readonly disabled?: boolean;
  readonly hitSlop?: number | Insets;
  readonly pressRetentionOffset?: number | Insets;
  readonly transitionProperties?: readonly PressableTransitionProperty[];
  readonly transitionDurationMs?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly accessibilityRole?: AccessibilityRole;
  readonly accessibilityState?: AccessibilityState;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
  readonly onLayout?: (event: LayoutChangeEvent) => void;
  readonly containerStyle?: StyleProp<ViewStyle>;
}

const DEFAULT_TRANSITION_PROPERTIES: PressableTransitionProperty[] = ["transform", "opacity"];

export const AnimatedPressable = memo<AnimatedPressableProps>(
  ({
    children,
    scaleTo = 0.97,
    hapticType,
    onPress,
    onLongPress,
    onHaptic,
    disabled = false,
    hitSlop,
    pressRetentionOffset = 16,
    transitionProperties,
    transitionDurationMs,
    style,
    containerStyle,
    accessibilityRole,
    accessibilityState,
    accessibilityLabel,
    accessibilityHint,
    testID,
    onLayout,
  }) => {
    const [pressed, setPressed] = useState(false);
    const reducedMotion = useReducedMotion();

    const handlePressIn = useCallback(() => {
      if (disabled) return;
      setPressed(true);
      if (hapticType && onHaptic) {
        void onHaptic(hapticType);
      }
    }, [disabled, hapticType, onHaptic]);

    const handlePressOut = useCallback(() => {
      setPressed(false);
    }, []);

    const isActivelyPressed = !disabled && pressed;
    const targetScale = isActivelyPressed && !reducedMotion ? scaleTo : 1;
    const targetOpacity = isActivelyPressed ? (reducedMotion ? 0.82 : 0.92) : 1;

    const pressFeedbackStyle = useMemo(
      () => ({
        transitionProperty: transitionProperties
          ? [...transitionProperties]
          : DEFAULT_TRANSITION_PROPERTIES,
        transitionDuration: transitionDurationMs ?? MOTION_DURATION.press,
        transitionTimingFunction: CSS_EASE_OUT,
        transform: [{ scale: targetScale }],
        opacity: targetOpacity,
      }),
      [transitionProperties, transitionDurationMs, targetScale, targetOpacity]
    );

    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={hitSlop}
        pressRetentionOffset={pressRetentionOffset}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled, ...accessibilityState }}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
        onLayout={onLayout}
        style={containerStyle}
      >
        <Animated.View style={[style, pressFeedbackStyle]}>{children}</Animated.View>
      </Pressable>
    );
  }
);

AnimatedPressable.displayName = "AnimatedPressable";
