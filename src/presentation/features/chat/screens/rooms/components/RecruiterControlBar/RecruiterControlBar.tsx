/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { styles } from "./RecruiterControlBar.styles";
import type { RecruiterControlBarProps } from "./RecruiterControlBar.types";

export const RecruiterControlBar = memo<RecruiterControlBarProps>(
  ({
    isOnline,
    isDark,
    isRTL,
    outboundQueueCount,
    onToggleOffline,
    onToggleTheme,
    onToggleLanguage,
    testID = "recruiter-control-bar",
  }) => {
    const { colors, t } = useUI();

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderStrong,
          },
        ]}
      >
        <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={[styles.titleGroup, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Ionicons name="options-outline" size={14} color={colors.accent} />
            <Text variant="xs" weight="bold" color={colors.textSecondary}>
              {t("rooms.recruiterDeckTitle")}
            </Text>
          </View>
          {outboundQueueCount > 0 ? (
            <View style={[styles.queueBadge, { backgroundColor: colors.warningTint }]}>
              <Text variant="xs" weight="bold" color={colors.warning}>
                {t("rooms.queuedBadge", { count: outboundQueueCount })}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.controlsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable
            testID="control-network-toggle"
            onPress={onToggleOffline}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: isOnline ? colors.successTint : colors.warningTint,
                borderColor: isOnline ? colors.successBorder : colors.warningBorder,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <View
              style={[styles.dot, { backgroundColor: isOnline ? colors.success : colors.warning }]}
            />
            <Text variant="xs" weight="bold" color={isOnline ? colors.success : colors.warning}>
              {isOnline ? t("rooms.onlineMode") : t("rooms.offlineMode")}
            </Text>
          </Pressable>

          <Pressable
            testID="control-theme-toggle"
            onPress={onToggleTheme}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: colors.primaryTint,
                borderColor: colors.borderStrong,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={13}
              color={colors.primary}
            />
            <Text variant="xs" weight="bold" color={colors.textPrimary}>
              {isDark ? t("rooms.darkTheme") : t("rooms.lightTheme")}
            </Text>
          </Pressable>

          <Pressable
            testID="control-language-toggle"
            onPress={onToggleLanguage}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: colors.cyanTint,
                borderColor: colors.borderStrong,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons name="globe-outline" size={13} color={colors.accent} />
            <Text variant="xs" weight="bold" color={colors.accent}>
              {t("rooms.languageToggle")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
);

RecruiterControlBar.displayName = "RecruiterControlBar";
