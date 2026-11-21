/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { type ComponentProps, memo, useMemo } from "react";
import { View } from "react-native";

import type { TxKeyPath } from "@/src/infrastructure/i18n/types";
import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import { gradients } from "@/src/presentation/theme";

import type { ChatRoomCategory } from "../../../../shared/types";
import { getInitials } from "../../../../shared/utils/text";

import { styles } from "./RoomListItem.styles";
import type { RoomListItemProps } from "./RoomListItem.types";

const CATEGORY_LABEL_KEYS: Record<Exclude<ChatRoomCategory, "ALL">, TxKeyPath> = {
  TRENDING: "rooms.categoryTrending",
  TECH: "rooms.categoryTech",
  DESIGN: "rooms.categoryDesign",
  FOUNDERS: "rooms.categoryFounders",
  ROULETTE: "rooms.categoryRoulette",
};

const getCategoryIcon = (
  category?: Exclude<ChatRoomCategory, "ALL">
): ComponentProps<typeof Ionicons>["name"] => {
  if (!category) return "chatbubble-ellipses";
  switch (category) {
    case "TRENDING":
      return "flame";
    case "TECH":
      return "code-slash";
    case "DESIGN":
      return "color-palette";
    case "FOUNDERS":
      return "rocket";
    case "ROULETTE":
      return "sparkles";
  }
};

export const RoomListItem = memo<RoomListItemProps>(({ room, onPress, testID }) => {
  const { colors, shadows, t, isRTL } = useUI();

  const timeLabel = useMemo(() => {
    const updatedMs = Date.parse(room.updatedAt);
    if (!Number.isFinite(updatedMs)) return "";
    const diffMs = Date.now() - updatedMs;
    const mins = Math.max(0, Math.floor(diffMs / 60_000));
    if (mins < 1) return t("chat.justNow");
    if (mins < 60) return t("chat.minutesAgo", { minutes: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("chat.hoursAgo", { hours });
    return t("chat.daysAgo", { days: Math.floor(hours / 24) });
  }, [room.updatedAt, t]);

  const isMatch = Boolean(room.isRouletteMatch);
  const unread = room.unreadCount ?? 0;
  const unreadLabel = unread > 99 ? "99+" : String(unread);
  const displayTitle = room.subject ?? room.participants[0]?.user?.fullName ?? t("chat.title");
  const previewText =
    room.lastMessage?.content ?? room.icebreaker ?? room.topic ?? t("chat.emptyDescription");
  const initials = useMemo(() => getInitials(displayTitle), [displayTitle]);
  const categoryIcon = getCategoryIcon(room.category);
  const categoryLabel = room.category ? t(CATEGORY_LABEL_KEYS[room.category]) : null;
  const isParticipantOnline = room.status === "OPEN" && (room.participantCount ?? 0) > 0;
  const showAccentRail = isMatch || unread > 0;

  return (
    <AnimatedPressable
      testID={testID ?? `room-card-${room.id}`}
      accessibilityRole="button"
      accessibilityLabel={[displayTitle, categoryLabel, previewText, timeLabel]
        .filter(Boolean)
        .join(", ")}
      onPress={() => onPress(room.id)}
      scaleTo={0.98}
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: isMatch ? colors.borderGlow : colors.border,
        },
      ]}
    >
      <View style={styles.cardInner}>
        {showAccentRail ? (
          <View
            style={[
              styles.accentRail,
              { backgroundColor: isMatch ? colors.accent : colors.primary },
            ]}
          />
        ) : null}

        <View style={styles.avatarContainer}>
          {isMatch ? (
            <LinearGradient
              colors={gradients.radarGlow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text variant="md" weight="bold" color={colors.textOnPrimary}>
                {initials}
              </Text>
            </LinearGradient>
          ) : (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.primaryTint,
                  borderColor: colors.borderStrong,
                },
              ]}
            >
              <Ionicons name={categoryIcon} size={22} color={colors.primary} />
            </View>
          )}
          {isParticipantOnline ? (
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.onlineDot,
                { backgroundColor: colors.success, borderColor: colors.surface },
              ]}
            />
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text
              variant="md"
              weight="bold"
              color={colors.textPrimary}
              numberOfLines={1}
              style={styles.title}
            >
              {displayTitle}
            </Text>
            {timeLabel ? (
              <Text variant="xs" color={colors.textMuted} style={styles.timeText}>
                {timeLabel}
              </Text>
            ) : null}
          </View>

          <View style={styles.topicRow}>
            {categoryLabel ? (
              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor: isMatch ? colors.accentTint : colors.primaryTint2,
                    borderColor: isMatch ? colors.accentBorder : colors.borderSubtle,
                  },
                ]}
              >
                {isMatch ? <Ionicons name="sparkles" size={10} color={colors.accent} /> : null}
                <Text variant="xs" weight="bold" color={isMatch ? colors.accent : colors.primary}>
                  {categoryLabel}
                </Text>
              </View>
            ) : null}

            <View style={styles.metaGroup}>
              <Ionicons
                name={room.partnerRole ? "briefcase-outline" : "people-outline"}
                size={11}
                color={colors.textMuted}
              />
              <Text variant="xs" color={colors.textSecondary} numberOfLines={1}>
                {room.partnerRole ??
                  t("rooms.membersOnline", { count: room.participantCount ?? 2 })}
              </Text>
            </View>
          </View>

          <Text variant="sm" color={colors.textSecondary} numberOfLines={1} style={styles.preview}>
            {previewText}
          </Text>
        </View>

        <View style={styles.rightColumn}>
          {unread > 0 ? (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: isMatch ? colors.accent : colors.primary },
              ]}
            >
              <Text variant="xs" weight="bold" color={colors.textOnPrimary} style={styles.tabular}>
                {unreadLabel}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.chevronCircle,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
            >
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={14}
                color={colors.textSecondary}
              />
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
});

RoomListItem.displayName = "RoomListItem";
