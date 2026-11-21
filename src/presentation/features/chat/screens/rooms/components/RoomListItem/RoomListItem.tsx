/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import { View } from "react-native";

import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { styles } from "./RoomListItem.styles";
import type { RoomListItemProps } from "./RoomListItem.types";

export const RoomListItem = memo<RoomListItemProps>(({ room, onPress, testID }) => {
  const { colors, t, isRTL } = useUI();

  const timeLabel = useMemo(() => {
    const diffMs = Date.now() - new Date(room.updatedAt).getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60_000));
    if (mins < 1) return t("chat.justNow");
    if (mins < 60) return t("chat.minutesAgo", { minutes: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("chat.hoursAgo", { hours });
    return t("chat.daysAgo", { days: Math.floor(hours / 24) });
  }, [room.updatedAt, t]);

  const isMatch = Boolean(room.isRouletteMatch);
  const previewText =
    room.lastMessage?.content ?? room.icebreaker ?? room.topic ?? t("chat.emptyDescription");
  const unread = room.unreadCount ?? 0;

  return (
    <AnimatedPressable
      testID={testID ?? `room-card-${room.id}`}
      onPress={() => onPress(room.id)}
      scaleTo={0.98}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isMatch ? colors.borderFocused : colors.borderStrong,
          flexDirection: isRTL ? "row-reverse" : "row",
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: isMatch ? colors.cyanTint : colors.primaryTint,
            borderColor: isMatch ? colors.accent : colors.primary,
          },
        ]}
      >
        <Ionicons
          name={isMatch ? "sparkles" : "chatbubble-ellipses-outline"}
          size={22}
          color={isMatch ? colors.accent : colors.primary}
        />
        <View
          style={[
            styles.onlineDot,
            { backgroundColor: colors.success, borderColor: colors.surface },
          ]}
        />
      </View>

      <View style={styles.body}>
        <View style={[styles.topRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text
            variant="md"
            weight="bold"
            color={colors.textPrimary}
            numberOfLines={1}
            style={styles.title}
          >
            {room.subject ?? room.participants[0]?.user?.fullName ?? t("chat.title")}
          </Text>
          <Text variant="xs" color={colors.textMuted}>
            {timeLabel}
          </Text>
        </View>

        <View style={[styles.topicRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: isMatch ? colors.cyanTint : colors.primaryTint2 },
            ]}
          >
            <Text variant="xs" weight="bold" color={isMatch ? colors.accent : colors.primary}>
              {room.category ?? "TECH"}
            </Text>
          </View>
          <Text variant="xs" color={colors.textSecondary} numberOfLines={1}>
            {t("rooms.membersOnline", { count: room.participantCount ?? 2 })}
          </Text>
        </View>

        <Text variant="sm" color={colors.textSecondary} numberOfLines={1} style={styles.preview}>
          {previewText}
        </Text>
      </View>

      <View style={styles.rightColumn}>
        {unread > 0 ? (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text variant="xs" weight="bold" color={colors.textOnPrimary}>
              {unread}
            </Text>
          </View>
        ) : (
          <Ionicons
            name={isRTL ? "chevron-back" : "chevron-forward"}
            size={18}
            color={colors.textMuted}
          />
        )}
      </View>
    </AnimatedPressable>
  );
});

RoomListItem.displayName = "RoomListItem";
