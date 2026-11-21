/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { CHAT_ROOM_CONTEXT_CARD_TEST_IDS } from "./ChatRoomContextCard.constants";
import { styles } from "./ChatRoomContextCard.styles";
import type { ChatRoomContextCardProps } from "./ChatRoomContextCard.types";

export const ChatRoomContextCard = memo(function ChatRoomContextCard({
  conversation,
  onSpinNext,
  testID = CHAT_ROOM_CONTEXT_CARD_TEST_IDS.ROOT,
}: ChatRoomContextCardProps) {
  const { colors, t, isRTL } = useUI();

  const topicLabel = conversation.topic ?? t("chat.topicContextTitle");
  const subtitleText = conversation.icebreaker ?? conversation.partnerRole ?? topicLabel;
  const badgeText = conversation.isRouletteMatch
    ? (conversation.partnerLocation ?? t("roulette.matchFound"))
    : t("rooms.membersOnline", { count: conversation.participantCount ?? 1 });

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.borderStrong,
        },
      ]}
    >
      <View style={[styles.topRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={[styles.topicRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Ionicons
            name={conversation.isRouletteMatch ? "flash" : "layers-outline"}
            size={15}
            color={colors.accent}
          />
          <Text variant="xs" weight="bold" color={colors.textPrimary} numberOfLines={1}>
            {topicLabel}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.cyanTint }]}>
          <Text variant="xs" weight="bold" color={colors.accent}>
            {badgeText}
          </Text>
        </View>
      </View>

      <View style={[styles.bottomRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text
          variant="xs"
          color={colors.textSecondary}
          numberOfLines={2}
          style={styles.icebreakerText}
        >
          {subtitleText}
        </Text>

        {onSpinNext ? (
          <Pressable
            testID={CHAT_ROOM_CONTEXT_CARD_TEST_IDS.CTA}
            onPress={onSpinNext}
            style={({ pressed }) => [
              styles.cta,
              { flexDirection: isRTL ? "row-reverse" : "row" },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text variant="xs" weight="bold" color={colors.primary}>
              {t("chat.topicContextCta")}
            </Text>
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={12}
              color={colors.primary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

ChatRoomContextCard.displayName = "ChatRoomContextCard";
