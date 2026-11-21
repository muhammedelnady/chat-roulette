/** @format */

import { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import { EASE_IN_OUT, FADE_DOWN_ENTER, FADE_DOWN_EXIT } from "@/src/presentation/theme";

import { CHAT_TYPING_TEST_IDS } from "./ChatTypingIndicator.constants";
import { styles } from "./ChatTypingIndicator.styles";
import type { ChatTypingIndicatorProps } from "./ChatTypingIndicator.types";

const EMPTY_TYPING_USERS: readonly string[] = [];

function dotStyleWorklet(value: number, reducedMotion: boolean) {
  "worklet";
  return {
    transform: reducedMotion ? [] : [{ translateY: -value * 4 }, { scale: 0.88 + value * 0.18 }],
    opacity: reducedMotion ? 0.72 : 0.4 + value * 0.6,
  };
}

export const ChatTypingIndicator = memo<ChatTypingIndicatorProps>(
  ({ typingUsers = EMPTY_TYPING_USERS, testID = CHAT_TYPING_TEST_IDS.ROOT }) => {
    const { colors, shadows, t } = useUI();
    const reducedMotion = useReducedMotion();
    const isActive = typingUsers.length > 0;

    const dotA = useSharedValue(0);
    const dotB = useSharedValue(0);
    const dotC = useSharedValue(0);

    useEffect(() => {
      cancelAnimation(dotA);
      cancelAnimation(dotB);
      cancelAnimation(dotC);

      if (isActive && !reducedMotion) {
        dotA.set(0);
        dotB.set(0);
        dotC.set(0);
        dotA.set(withRepeat(withTiming(1, { duration: 460, easing: EASE_IN_OUT }), -1, true));
        dotB.set(
          withDelay(
            130,
            withRepeat(withTiming(1, { duration: 460, easing: EASE_IN_OUT }), -1, true)
          )
        );
        dotC.set(
          withDelay(
            260,
            withRepeat(withTiming(1, { duration: 460, easing: EASE_IN_OUT }), -1, true)
          )
        );
      } else {
        dotA.set(0);
        dotB.set(0);
        dotC.set(0);
      }

      return () => {
        cancelAnimation(dotA);
        cancelAnimation(dotB);
        cancelAnimation(dotC);
      };
    }, [isActive, reducedMotion, dotA, dotB, dotC]);

    const dotAStyle = useAnimatedStyle(
      () => dotStyleWorklet(dotA.get(), reducedMotion),
      [reducedMotion]
    );
    const dotBStyle = useAnimatedStyle(
      () => dotStyleWorklet(dotB.get(), reducedMotion),
      [reducedMotion]
    );
    const dotCStyle = useAnimatedStyle(
      () => dotStyleWorklet(dotC.get(), reducedMotion),
      [reducedMotion]
    );

    if (!isActive) {
      return null;
    }

    const typingText =
      typingUsers.length === 1
        ? t("chat.typing")
        : t("chat.typingPlural", { count: typingUsers.length });

    return (
      <Animated.View
        testID={testID}
        accessibilityLiveRegion="polite"
        entering={FADE_DOWN_ENTER}
        exiting={FADE_DOWN_EXIT}
        style={styles.container}
      >
        <View
          style={[
            styles.bubble,
            shadows.sm,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View testID={CHAT_TYPING_TEST_IDS.DOTS} style={styles.dotsRow}>
            <Animated.View style={[styles.dot, { backgroundColor: colors.accent }, dotAStyle]} />
            <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, dotBStyle]} />
            <Animated.View style={[styles.dot, { backgroundColor: colors.accent }, dotCStyle]} />
          </View>
          <Text
            testID={CHAT_TYPING_TEST_IDS.TEXT}
            variant="xs"
            weight="medium"
            color={colors.textSecondary}
            style={styles.text}
          >
            {typingText}
          </Text>
        </View>
      </Animated.View>
    );
  }
);

ChatTypingIndicator.displayName = "ChatTypingIndicator";
