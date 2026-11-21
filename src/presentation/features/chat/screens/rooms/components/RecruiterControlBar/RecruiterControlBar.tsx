/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { AnimatedPressable, PulseDot, Text } from "@/src/presentation/components/atoms";
import { useHaptics, useUI } from "@/src/presentation/hooks";
import {
  CSS_EASE_OUT,
  MOTION_DURATION,
  SOFT_POP_ENTER,
  SOFT_POP_EXIT,
} from "@/src/presentation/theme";

import { styles } from "./RecruiterControlBar.styles";
import type { RecruiterControlBarProps } from "./RecruiterControlBar.types";

const PILL_TRANSITION_PROPERTIES = [
  "transform",
  "opacity",
  "backgroundColor",
  "borderColor",
] as const;

const PILL_HIT_SLOP = { top: 8, bottom: 8, left: 4, right: 4 } as const;

export const RecruiterControlBar = memo<RecruiterControlBarProps>(
  ({
    isOnline,
    isDark,
    isActive = true,
    showOfflineSim = true,
    outboundQueueCount,
    onToggleOffline,
    onToggleTheme,
    onToggleLanguage,
    testID = "recruiter-control-bar",
  }) => {
    const { colors, shadows, t } = useUI();
    const haptics = useHaptics();
    const reducedMotion = useReducedMotion();

    const handleNetworkPress = useCallback(() => {
      void haptics.selection();
      onToggleOffline();
    }, [haptics, onToggleOffline]);

    const handleThemePress = useCallback(() => {
      void haptics.selection();
      onToggleTheme();
    }, [haptics, onToggleTheme]);

    const handleLanguagePress = useCallback(() => {
      void haptics.selection();
      onToggleLanguage();
    }, [haptics, onToggleLanguage]);

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          shadows.sm,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={[styles.eyebrowIcon, { backgroundColor: colors.accentTint }]}>
              <Ionicons name="options-outline" size={12} color={colors.accent} />
            </View>
            <Text
              variant="xs"
              weight="bold"
              color={colors.textSecondary}
              style={styles.eyebrowText}
            >
              {t("rooms.recruiterDeckTitle")}
            </Text>
          </View>
          {outboundQueueCount > 0 ? (
            <Animated.View
              entering={SOFT_POP_ENTER}
              exiting={SOFT_POP_EXIT}
              style={[
                styles.queueBadge,
                { backgroundColor: colors.warningTint, borderColor: colors.warningBorder },
              ]}
            >
              <Text variant="xs" weight="bold" color={colors.warning} style={styles.tabular}>
                {t("rooms.queuedBadge", { count: outboundQueueCount })}
              </Text>
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.syncBadge,
                {
                  backgroundColor: isOnline ? colors.successTint : colors.warningTint,
                  borderColor: isOnline ? colors.successBorder : colors.warningBorder,
                  transitionProperty: ["backgroundColor", "borderColor"],
                  transitionDuration: MOTION_DURATION.fast,
                  transitionTimingFunction: CSS_EASE_OUT,
                },
              ]}
            >
              <PulseDot
                color={isOnline ? colors.success : colors.warning}
                size={7}
                haloSize={12}
                active={isOnline && isActive}
              />
            </Animated.View>
          )}
        </View>

        <View style={styles.controlsRow}>
          {showOfflineSim ? (
            <AnimatedPressable
              testID="control-network-toggle"
              accessibilityRole="button"
              accessibilityLabel={t("chat.toggleOfflineMode")}
              accessibilityState={{ selected: !isOnline }}
              scaleTo={0.96}
              hitSlop={PILL_HIT_SLOP}
              transitionProperties={PILL_TRANSITION_PROPERTIES}
              transitionDurationMs={MOTION_DURATION.fast}
              onPress={handleNetworkPress}
              containerStyle={styles.pillWrapper}
              style={[
                styles.pill,
                {
                  backgroundColor: isOnline ? colors.successTint : colors.warningTint,
                  borderColor: isOnline ? colors.successBorder : colors.warningBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isOnline ? colors.success : colors.warning },
                ]}
              />
              <Text
                variant="xs"
                weight="bold"
                color={isOnline ? colors.success : colors.warning}
                numberOfLines={1}
              >
                {isOnline ? t("rooms.onlineMode") : t("rooms.offlineMode")}
              </Text>
            </AnimatedPressable>
          ) : null}

          <AnimatedPressable
            testID="control-theme-toggle"
            accessibilityRole="button"
            accessibilityLabel={t("rooms.toggleTheme")}
            accessibilityState={{ selected: isDark }}
            scaleTo={0.96}
            hitSlop={PILL_HIT_SLOP}
            onPress={handleThemePress}
            containerStyle={styles.pillWrapper}
            style={[
              styles.pill,
              {
                backgroundColor: colors.primaryTint,
                borderColor: colors.borderGlow,
              },
            ]}
          >
            <Animated.View
              style={{
                transform: [{ rotate: isDark || reducedMotion ? "0deg" : "24deg" }],
                transitionProperty: "transform",
                transitionDuration: MOTION_DURATION.normal,
                transitionTimingFunction: CSS_EASE_OUT,
              }}
            >
              <Ionicons
                name={isDark ? "moon-outline" : "sunny-outline"}
                size={13}
                color={colors.primary}
              />
            </Animated.View>
            <Text variant="xs" weight="bold" color={colors.textPrimary} numberOfLines={1}>
              {isDark ? t("rooms.darkTheme") : t("rooms.lightTheme")}
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            testID="control-language-toggle"
            accessibilityRole="button"
            accessibilityLabel={t("rooms.toggleLanguage")}
            scaleTo={0.96}
            hitSlop={PILL_HIT_SLOP}
            onPress={handleLanguagePress}
            containerStyle={styles.pillWrapper}
            style={[
              styles.pill,
              {
                backgroundColor: colors.accentTint,
                borderColor: colors.accentBorder,
              },
            ]}
          >
            <Ionicons name="globe-outline" size={13} color={colors.accent} />
            <Text variant="xs" weight="bold" color={colors.accent} numberOfLines={1}>
              {t("rooms.languageToggle")}
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }
);

RecruiterControlBar.displayName = "RecruiterControlBar";
