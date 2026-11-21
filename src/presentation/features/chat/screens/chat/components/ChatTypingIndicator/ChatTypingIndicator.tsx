/** @format */

import { memo } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { CHAT_TYPING_TEST_IDS } from "./ChatTypingIndicator.constants";
import { styles } from "./ChatTypingIndicator.styles";
import type { ChatTypingIndicatorProps } from "./ChatTypingIndicator.types";

export const ChatTypingIndicator = memo<ChatTypingIndicatorProps>(
  ({ typingUsers = [], testID = CHAT_TYPING_TEST_IDS.ROOT }) => {
    const { colors, t } = useUI();

    if (typingUsers.length === 0) {
      return null;
    }

    const typingText =
      typingUsers.length === 1
        ? t("chat.typing")
        : t("chat.typingPlural", { count: typingUsers.length });

    return (
      <Animated.View
        testID={testID}
        entering={FadeInDown.duration(150)}
        exiting={FadeOutDown.duration(120)}
        style={styles.container}
      >
        <View
          style={[
            styles.bubble,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong },
          ]}
        >
          <View testID={CHAT_TYPING_TEST_IDS.DOTS} style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          </View>
          <Text
            testID={CHAT_TYPING_TEST_IDS.TEXT}
            variant="xs"
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
