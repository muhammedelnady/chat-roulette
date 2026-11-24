/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import { EASE_IN_OUT, FADE_ENTER, gradients } from "@/src/presentation/theme";

import { CHAT_EMPTY_STATE_TEST_IDS } from "./ChatEmptyState.constants";
import { styles } from "./ChatEmptyState.styles";
import type { ChatEmptyStateProps } from "./ChatEmptyState.types";

export const ChatEmptyState = memo<ChatEmptyStateProps>(
  ({ title, description, testID = CHAT_EMPTY_STATE_TEST_IDS.ROOT }) => {
    const { colors, shadows, t } = useUI();
    const reducedMotion = useReducedMotion();
    const halo = useSharedValue(0);

    useEffect(() => {
      cancelAnimation(halo);
      if (!reducedMotion) {
        halo.set(0);
        halo.set(withRepeat(withTiming(1, { duration: 2800, easing: EASE_IN_OUT }), -1, true));
      } else {
        halo.set(0);
      }

      return () => {
        cancelAnimation(halo);
      };
    }, [halo, reducedMotion]);

    const haloStyle = useAnimatedStyle(() => {
      const progress = halo.get();
      if (reducedMotion) {
        return { transform: [], opacity: 1 };
      }
      return {
        transform: [{ scale: interpolate(progress, [0, 1], [1, 1.06], Extrapolation.CLAMP) }],
        opacity: interpolate(progress, [0, 1], [0.72, 1], Extrapolation.CLAMP),
      };
    });

    const displayTitle = title ?? t("chat.emptyTitle");
    const displayDescription = description ?? t("chat.emptyDescription");

    return (
      <Animated.View testID={testID} entering={FADE_ENTER} style={styles.container}>
        <Animated.View
          style={[
            styles.outerHalo,
            shadows.glowPrimary,
            { backgroundColor: colors.primaryTint2, borderColor: colors.borderSubtle },
            haloStyle,
          ]}
        >
          <LinearGradient
            colors={gradients.radarGlow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBorderRing}
          >
            <View
              testID={CHAT_EMPTY_STATE_TEST_IDS.ICON_CONTAINER}
              style={[styles.iconWrapper, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="chatbubbles-outline" size={34} color={colors.accent} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Text
          testID={CHAT_EMPTY_STATE_TEST_IDS.TITLE}
          variant="lg"
          weight="bold"
          color={colors.textPrimary}
          centered
          style={styles.title}
        >
          {displayTitle}
        </Text>

        <Text
          testID={CHAT_EMPTY_STATE_TEST_IDS.DESCRIPTION}
          variant="sm"
          color={colors.textSecondary}
          centered
          style={styles.description}
        >
          {displayDescription}
        </Text>
      </Animated.View>
    );
  }
);

ChatEmptyState.displayName = "ChatEmptyState";
