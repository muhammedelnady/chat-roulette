/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { QUEUE_STATUS_BANNER_TEST_IDS } from "./QueueStatusBanner.constants";
import { styles } from "./QueueStatusBanner.styles";
import type { QueueStatusBannerProps } from "./QueueStatusBanner.types";

export const QueueStatusBanner = memo<QueueStatusBannerProps>(
  ({
    queueStatus,
    isOffline = false,
    pendingCount = 0,
    testID = QUEUE_STATUS_BANNER_TEST_IDS.ROOT,
  }) => {
    const { colors, t, isRTL } = useUI();

    if (isOffline) {
      return (
        <View
          testID={testID}
          style={[
            styles.container,
            {
              backgroundColor: colors.warningTint,
              borderColor: colors.warningBorder,
            },
          ]}
        >
          <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={[styles.leftGroup, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
              <Text variant="xs" weight="bold" color={colors.warning}>
                {t("chat.offlineBannerTitle")}
              </Text>
            </View>
            <View style={[styles.positionBadge, { backgroundColor: colors.warning }]}>
              <Text variant="xs" weight="bold" color={colors.textOnPrimary}>
                {pendingCount}
              </Text>
            </View>
          </View>
          <Text variant="xs" color={colors.textSecondary} style={styles.messageText}>
            {t("chat.offlineBannerBody", { count: pendingCount })}
          </Text>
        </View>
      );
    }

    if (!queueStatus) {
      return null;
    }

    if (queueStatus.status === "ASSIGNED" || queueStatus.isAgentAssigned) {
      const staffName = queueStatus.assignedStaff?.name ?? queueStatus.assignedAgentName;
      const assignedText = staffName
        ? `${t("chat.agentAssigned")}: ${staffName}`
        : t("chat.agentAssigned");

      return (
        <View
          testID={testID}
          style={[
            styles.container,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <View style={styles.leftGroup}>
            <View
              testID={QUEUE_STATUS_BANNER_TEST_IDS.POSITION}
              style={[styles.positionBadge, { backgroundColor: colors.primary }]}
            >
              <Text variant="xs" weight="bold" color={colors.textOnPrimary}>
                {assignedText}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    const { queuePosition, estimatedWaitMinutes } = queueStatus;
    if (queuePosition <= 0) {
      return null;
    }

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          { backgroundColor: colors.cardBackground, borderColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            testID={QUEUE_STATUS_BANNER_TEST_IDS.POSITION}
            style={[styles.positionBadge, { backgroundColor: colors.primary }]}
          >
            <Text variant="xs" weight="bold" color={colors.textOnPrimary}>
              {t("chat.queuePosition", { position: queuePosition })}
            </Text>
          </View>
          <View
            testID={QUEUE_STATUS_BANNER_TEST_IDS.WAIT_TIME}
            style={[styles.waitChip, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
            <Text variant="xs" color={colors.textSecondary}>
              {t("chat.estimatedWait", { minutes: estimatedWaitMinutes })}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

QueueStatusBanner.displayName = "QueueStatusBanner";
