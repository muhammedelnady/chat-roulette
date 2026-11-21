/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { CHAT_HEADER_TEST_IDS } from "./ChatHeader.constants";
import { styles } from "./ChatHeader.styles";
import type { ChatHeaderProps } from "./ChatHeader.types";

export const ChatHeader = memo<ChatHeaderProps>(
  ({
    title,
    subtitle,
    isOnline = true,
    isRouletteMatch = false,
    onBackPress,
    onToggleOffline,
    testID = CHAT_HEADER_TEST_IDS.ROOT,
  }) => {
    const { colors, t, isRTL } = useUI();

    const displayTitle = title ?? t("chat.title");
    const displaySubtitle =
      subtitle ?? (isOnline ? t("chat.supportOnline") : t("chat.supportOffline"));

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        {onBackPress ? (
          <Pressable
            testID={CHAT_HEADER_TEST_IDS.BACK_BUTTON}
            onPress={onBackPress}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderStrong,
              },
              pressed && { opacity: 0.7 },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
        ) : null}

        <View
          style={[
            styles.avatarBadge,
            {
              backgroundColor: isRouletteMatch ? colors.cyanTint : colors.primaryTint,
              borderColor: isRouletteMatch ? colors.accent : colors.primary,
            },
          ]}
        >
          <Ionicons
            name={isRouletteMatch ? "sparkles" : "planet-outline"}
            size={18}
            color={isRouletteMatch ? colors.accent : colors.primary}
          />
          <View
            testID={CHAT_HEADER_TEST_IDS.PRESENCE_DOT}
            style={[
              styles.presenceDot,
              {
                backgroundColor: isOnline ? colors.success : colors.warning,
                borderColor: colors.surface,
              },
            ]}
          />
        </View>

        <View style={styles.content}>
          <Text
            testID={CHAT_HEADER_TEST_IDS.TITLE}
            variant="md"
            weight="bold"
            color={colors.textPrimary}
            numberOfLines={1}
          >
            {displayTitle}
          </Text>
          <Text
            testID={CHAT_HEADER_TEST_IDS.STATUS}
            variant="xs"
            color={isOnline ? colors.accent : colors.warning}
            numberOfLines={1}
          >
            {displaySubtitle}
          </Text>
        </View>

        {onToggleOffline ? (
          <Pressable
            testID={CHAT_HEADER_TEST_IDS.NETWORK_TOGGLE}
            onPress={onToggleOffline}
            style={({ pressed }) => [
              styles.networkChip,
              {
                backgroundColor: isOnline ? colors.successTint : colors.warningTint,
                borderColor: isOnline ? colors.successBorder : colors.warningBorder,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <View
              style={[
                styles.networkDot,
                { backgroundColor: isOnline ? colors.success : colors.warning },
              ]}
            />
            <Text variant="xs" weight="bold" color={isOnline ? colors.success : colors.warning}>
              {isOnline ? t("rooms.onlineMode") : t("rooms.offlineMode")}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
);

ChatHeader.displayName = "ChatHeader";
