/** @format */

import { memo, type ReactNode, useCallback } from "react";
import type {
  AccessibilityRole,
  AccessibilityState,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import type { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";

const SPRING_CONFIG = { stiffness: 300, damping: 20 };

export interface AnimatedPressableProps {
  readonly children?: ReactNode;
  readonly scaleTo?: number;
  readonly hapticType?: HapticFeedbackType | null;
  readonly onPress?: () => void;
  readonly onHaptic?: (type: HapticFeedbackType) => Promise<void>;
  readonly disabled?: boolean;
  readonly hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
  readonly style?: StyleProp<ViewStyle>;
  readonly accessibilityRole?: AccessibilityRole;
  readonly accessibilityState?: AccessibilityState;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
  readonly onLayout?: (event: LayoutChangeEvent) => void;
  readonly containerStyle?: StyleProp<ViewStyle>;
}

export const AnimatedPressable = memo<AnimatedPressableProps>(
  ({
    children,
    scaleTo = 0.96,
    hapticType,
    onPress,
    onHaptic,
    disabled = false,
    hitSlop,
    style,
    containerStyle,
    accessibilityRole,
    accessibilityState,
    accessibilityLabel,
    accessibilityHint,
    testID,
    onLayout,
  }) => {
    const scaleSV = useSharedValue(1);
    const opacitySV = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleSV.value }],
      opacity: opacitySV.value,
    }));

    const handlePressIn = useCallback(() => {
      if (disabled) return;
      scaleSV.value = withSpring(scaleTo, SPRING_CONFIG);
      opacitySV.value = withSpring(0.9, SPRING_CONFIG);
      if (hapticType && onHaptic) {
        void onHaptic(hapticType);
      }
    }, [disabled, scaleTo, scaleSV, opacitySV, hapticType, onHaptic]);

    const handlePressOut = useCallback(() => {
      if (disabled) return;
      scaleSV.value = withSpring(1, SPRING_CONFIG);
      opacitySV.value = withSpring(1, SPRING_CONFIG);
    }, [disabled, scaleSV, opacitySV]);

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={hitSlop}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled, ...accessibilityState }}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
        onLayout={onLayout}
        style={containerStyle}
      >
        <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
      </Pressable>
    );
  }
);

AnimatedPressable.displayName = "AnimatedPressable";
