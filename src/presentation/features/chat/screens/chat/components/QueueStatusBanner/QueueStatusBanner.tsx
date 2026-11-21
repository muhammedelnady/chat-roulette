/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { PulseDot, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import {
  CSS_EASE_OUT,
  FADE_UP_ENTER,
  FADE_UP_EXIT,
  MOTION_DURATION,
} from "@/src/presentation/theme";

import { QUEUE_STATUS_BANNER_TEST_IDS } from "./QueueStatusBanner.constants";
import { styles } from "./QueueStatusBanner.styles";
import type { QueueStatusBannerProps } from "./QueueStatusBanner.types";

const BANNER_TRANSITION_PROPERTIES: ("backgroundColor" | "borderColor")[] = [
  "backgroundColor",
  "borderColor",
];

export const QueueStatusBanner = memo<QueueStatusBannerProps>(
  ({
    queueStatus,
    isOffline = false,
    pendingCount = 0,
    testID = QUEUE_STATUS_BANNER_TEST_IDS.ROOT,
  }) => {
    const { colors, shadows, t } = useUI();

    if (isOffline) {
      return (
        <Animated.View
          key="offline"
          testID={testID}
          accessibilityLiveRegion="polite"
          entering={FADE_UP_ENTER}
          exiting={FADE_UP_EXIT}
          style={[
            styles.container,
            shadows.sm,
            {
              backgroundColor: colors.warningTint,
              borderColor: colors.warningBorder,
              transitionProperty: BANNER_TRANSITION_PROPERTIES,
              transitionDuration: MOTION_DURATION.fast,
              transitionTimingFunction: CSS_EASE_OUT,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.leftGroup}>
              <View style={[styles.iconMedallion, { backgroundColor: colors.surface }]}>
                <Ionicons name="cloud-offline-outline" size={15} color={colors.warning} />
              </View>
              <Text variant="xs" weight="bold" color={colors.warning}>
                {t("chat.offlineBannerTitle")}
              </Text>
            </View>
            <View style={[styles.positionBadge, { backgroundColor: colors.warning }]}>
              <Text variant="xs" weight="bold" color={colors.textOnPrimary} style={styles.tabular}>
                {pendingCount}
              </Text>
            </View>
          </View>
          <Text variant="xs" color={colors.textSecondary} style={styles.messageText}>
            {t("chat.offlineBannerBody", { count: pendingCount })}
          </Text>
        </Animated.View>
      );
    }

    if (pendingCount > 0) {
      return (
        <Animated.View
          key="syncing"
          testID={testID}
          accessibilityLiveRegion="polite"
          entering={FADE_UP_ENTER}
          exiting={FADE_UP_EXIT}
          style={[
            styles.container,
            shadows.sm,
            {
              backgroundColor: colors.infoTint,
              borderColor: colors.infoBorder,
              transitionProperty: BANNER_TRANSITION_PROPERTIES,
              transitionDuration: MOTION_DURATION.fast,
              transitionTimingFunction: CSS_EASE_OUT,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.leftGroup}>
              <View style={[styles.iconMedallion, { backgroundColor: colors.surface }]}>
                <Ionicons name="sync-outline" size={15} color={colors.info} />
              </View>
              <Text variant="xs" weight="bold" color={colors.info}>
                {t("chat.syncingBannerTitle")}
              </Text>
            </View>
            <View style={[styles.positionBadge, { backgroundColor: colors.info }]}>
              <Text variant="xs" weight="bold" color={colors.textOnPrimary} style={styles.tabular}>
                {pendingCount}
              </Text>
            </View>
          </View>
          <Text variant="xs" color={colors.textSecondary} style={styles.messageText}>
            {t("chat.syncingBannerBody", { count: pendingCount })}
          </Text>
        </Animated.View>
      );
    }

    if (!queueStatus) {
      return null;
    }

    if (queueStatus.status === "ASSIGNED" || queueStatus.isAgentAssigned) {
      const staffName = queueStatus.assignedStaff?.name ?? queueStatus.assignedAgentName;
      const assignedText = staffName
        ? t("chat.agentAssignedNamed", { name: staffName })
        : t("chat.agentAssigned");

      return (
        <Animated.View
          key="assigned"
          testID={testID}
          entering={FADE_UP_ENTER}
          exiting={FADE_UP_EXIT}
          style={[
            styles.container,
            shadows.sm,
            {
              backgroundColor: colors.surface,
              borderColor: colors.successBorder,
              transitionProperty: BANNER_TRANSITION_PROPERTIES,
              transitionDuration: MOTION_DURATION.fast,
              transitionTimingFunction: CSS_EASE_OUT,
            },
          ]}
        >
          <View style={styles.leftGroup}>
            <View style={[styles.iconMedallion, { backgroundColor: colors.successTint }]}>
              <Ionicons name="checkmark-circle-outline" size={15} color={colors.success} />
            </View>
            <View
              testID={QUEUE_STATUS_BANNER_TEST_IDS.POSITION}
              style={[styles.positionBadge, { backgroundColor: colors.success }]}
            >
              <Text variant="xs" weight="bold" color={colors.textOnPrimary}>
                {assignedText}
              </Text>
            </View>
          </View>
        </Animated.View>
      );
    }

    const { queuePosition, estimatedWaitMinutes } = queueStatus;
    if (queuePosition <= 0) {
      return null;
    }

    return (
      <Animated.View
        key="waiting"
        testID={testID}
        entering={FADE_UP_ENTER}
        exiting={FADE_UP_EXIT}
        style={[
          styles.container,
          shadows.sm,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderGlow,
            transitionProperty: BANNER_TRANSITION_PROPERTIES,
            transitionDuration: MOTION_DURATION.fast,
            transitionTimingFunction: CSS_EASE_OUT,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.leftGroup}>
            <View style={[styles.iconMedallion, { backgroundColor: colors.primaryTint }]}>
              <Ionicons name="pulse-outline" size={15} color={colors.primary} />
            </View>
            <PulseDot
              color={colors.primary}
              haloColor={colors.primaryTint}
              size={7}
              haloSize={14}
              active
            />
            <View
              testID={QUEUE_STATUS_BANNER_TEST_IDS.POSITION}
              style={[styles.positionBadge, { backgroundColor: colors.primary }]}
            >
              <Text variant="xs" weight="bold" color={colors.textOnPrimary} style={styles.tabular}>
                {t("chat.queuePosition", { position: queuePosition })}
              </Text>
            </View>
          </View>
          <View
            testID={QUEUE_STATUS_BANNER_TEST_IDS.WAIT_TIME}
            style={[
              styles.waitChip,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
            <Text variant="xs" color={colors.textSecondary} style={styles.tabular}>
              {t("chat.estimatedWait", { minutes: estimatedWaitMinutes })}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }
);

QueueStatusBanner.displayName = "QueueStatusBanner";
