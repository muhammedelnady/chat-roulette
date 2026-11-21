/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback } from "react";
import { View } from "react-native";

import { AnimatedPressable, PulseDot, Text } from "@/src/presentation/components/atoms";
import { useHaptics, useScreenFocused, useUI } from "@/src/presentation/hooks";
import { gradients, MOTION_DURATION } from "@/src/presentation/theme";

import { CHAT_HEADER_TEST_IDS } from "./ChatHeader.constants";
import { styles } from "./ChatHeader.styles";
import type { ChatHeaderProps } from "./ChatHeader.types";

const NETWORK_CHIP_TRANSITION = ["transform", "opacity", "backgroundColor", "borderColor"] as const;

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
    const { colors, shadows, t, isRTL } = useUI();
    const haptics = useHaptics();
    const isScreenActive = useScreenFocused();

    const displayTitle = title ?? t("chat.title");
    const displaySubtitle =
      subtitle ?? (isOnline ? t("chat.supportOnline") : t("chat.supportOffline"));

    const handleNetworkToggle = useCallback(() => {
      void haptics.selection();
      onToggleOffline?.();
    }, [haptics, onToggleOffline]);

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          shadows.sm,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        {onBackPress ? (
          <AnimatedPressable
            testID={CHAT_HEADER_TEST_IDS.BACK_BUTTON}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            scaleTo={0.95}
            onPress={onBackPress}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={20}
              color={colors.textPrimary}
            />
          </AnimatedPressable>
        ) : null}

        <View style={styles.avatarWrapper}>
          {isRouletteMatch ? (
            <LinearGradient
              colors={gradients.radarGlow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Ionicons name="sparkles" size={18} color={colors.textOnPrimary} />
            </LinearGradient>
          ) : (
            <View
              style={[
                styles.avatarBadge,
                {
                  backgroundColor: colors.primaryTint,
                  borderColor: colors.borderGlow,
                },
              ]}
            >
              <Ionicons name="planet-outline" size={19} color={colors.primary} />
            </View>
          )}
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
          <View style={styles.statusRow}>
            <PulseDot
              color={isOnline ? colors.success : colors.warning}
              size={6}
              haloSize={10}
              active={isOnline && isScreenActive}
            />
            <Text
              testID={CHAT_HEADER_TEST_IDS.STATUS}
              variant="xs"
              weight="medium"
              color={isOnline ? colors.accent : colors.warning}
              numberOfLines={1}
              style={styles.statusText}
            >
              {displaySubtitle}
            </Text>
          </View>
        </View>

        {onToggleOffline ? (
          <AnimatedPressable
            testID={CHAT_HEADER_TEST_IDS.NETWORK_TOGGLE}
            accessibilityRole="button"
            accessibilityLabel={t("chat.toggleOfflineMode")}
            accessibilityState={{ selected: !isOnline }}
            scaleTo={0.95}
            hitSlop={8}
            transitionProperties={NETWORK_CHIP_TRANSITION}
            transitionDurationMs={MOTION_DURATION.fast}
            onPress={handleNetworkToggle}
            style={[
              styles.networkChip,
              {
                backgroundColor: isOnline ? colors.successTint : colors.warningTint,
                borderColor: isOnline ? colors.successBorder : colors.warningBorder,
              },
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
          </AnimatedPressable>
        ) : null}
      </View>
    );
  }
);

ChatHeader.displayName = "ChatHeader";
