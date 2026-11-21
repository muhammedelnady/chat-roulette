/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useHaptics, useUI } from "@/src/presentation/hooks";
import { CSS_EASE_OUT, MOTION_DURATION } from "@/src/presentation/theme";

import { CHAT_ROOM_CONTEXT_CARD_TEST_IDS } from "./ChatRoomContextCard.constants";
import { styles } from "./ChatRoomContextCard.styles";
import type { ChatRoomContextCardProps } from "./ChatRoomContextCard.types";

export const ChatRoomContextCard = memo(function ChatRoomContextCard({
  conversation,
  onSpinNext,
  testID = CHAT_ROOM_CONTEXT_CARD_TEST_IDS.ROOT,
}: ChatRoomContextCardProps) {
  const { colors, shadows, t } = useUI();
  const haptics = useHaptics();

  const isMatch = Boolean(conversation.isRouletteMatch);
  const topicLabel = conversation.topic ?? t("chat.topicContextTitle");
  const subtitleText = conversation.icebreaker ?? conversation.partnerRole ?? topicLabel;
  const badgeText = isMatch
    ? (conversation.partnerLocation ?? t("roulette.matchFound"))
    : t("rooms.membersOnline", { count: conversation.participantCount ?? 1 });

  const handleSpinPress = useCallback(() => {
    void haptics.selection();
    onSpinNext?.();
  }, [haptics, onSpinNext]);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: isMatch ? colors.borderGlow : colors.border,
          transitionProperty: "borderColor",
          transitionDuration: MOTION_DURATION.fast,
          transitionTimingFunction: CSS_EASE_OUT,
        },
      ]}
    >
      <View
        style={[styles.accentRail, { backgroundColor: isMatch ? colors.accent : colors.primary }]}
      />

      <View style={styles.innerContent}>
        <View style={styles.topRow}>
          <View style={styles.topicRow}>
            <View
              style={[
                styles.topicIconBadge,
                { backgroundColor: isMatch ? colors.accentTint : colors.primaryTint },
              ]}
            >
              <Ionicons
                name={isMatch ? "flash" : "layers-outline"}
                size={13}
                color={isMatch ? colors.accent : colors.primary}
              />
            </View>
            <Text
              variant="xs"
              weight="bold"
              color={colors.textPrimary}
              numberOfLines={1}
              style={styles.topicText}
            >
              {topicLabel}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.accentTint, borderColor: colors.accentBorder },
            ]}
          >
            <Text variant="xs" weight="bold" color={colors.accent} style={styles.tabular}>
              {badgeText}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text
            variant="xs"
            color={colors.textSecondary}
            numberOfLines={2}
            style={styles.icebreakerText}
          >
            {subtitleText}
          </Text>

          {onSpinNext ? (
            <AnimatedPressable
              testID={CHAT_ROOM_CONTEXT_CARD_TEST_IDS.CTA}
              accessibilityRole="button"
              accessibilityLabel={t("chat.topicContextCta")}
              scaleTo={0.96}
              hitSlop={8}
              onPress={handleSpinPress}
              style={[
                styles.cta,
                {
                  backgroundColor: colors.primaryTint,
                  borderColor: colors.borderGlow,
                },
              ]}
            >
              <Ionicons name="shuffle" size={12} color={colors.primary} />
              <Text variant="xs" weight="bold" color={colors.primary}>
                {t("chat.topicContextCta")}
              </Text>
            </AnimatedPressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
});

ChatRoomContextCard.displayName = "ChatRoomContextCard";
