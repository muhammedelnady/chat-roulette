/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";

import { useUI } from "@/src/presentation/hooks";

import type { ChatMessageEntity } from "../../../../shared/types";

import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";
import { styles } from "./ChatMessageBubble.styles";

export interface MessageStatusTickProps {
  readonly isOwn: boolean;
  readonly status: ChatMessageEntity["status"];
  readonly readReceipts?: ChatMessageEntity["readReceipts"];
}

export const MessageStatusTick = memo<MessageStatusTickProps>(
  ({ isOwn, status, readReceipts = [] }) => {
    const { colors, t } = useUI();

    if (!isOwn) return null;

    const normalizedStatus = status?.toUpperCase();

    if (normalizedStatus === "FAILED") {
      return (
        <Ionicons
          testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.STATUS_TICK}
          accessibilityLabel={t("chat.statusFailed")}
          name="alert-circle"
          size={14}
          color={colors.error}
          style={styles.tickIcon}
        />
      );
    }

    const isRead = normalizedStatus === "READ" || readReceipts.length > 0;
    const isDelivered = normalizedStatus === "DELIVERED";
    const isSent = normalizedStatus === "SENT" || !normalizedStatus;

    if (isRead) {
      return (
        <Ionicons
          testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.STATUS_TICK}
          accessibilityLabel={t("chat.statusRead")}
          name="checkmark-done"
          size={14}
          color={colors.accent}
          style={styles.tickIcon}
        />
      );
    }

    if (isDelivered) {
      return (
        <Ionicons
          testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.STATUS_TICK}
          accessibilityLabel={t("chat.statusDelivered")}
          name="checkmark-done"
          size={14}
          color={colors.textOnPrimary}
          style={styles.tickIcon}
        />
      );
    }

    if (isSent) {
      return (
        <Ionicons
          testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.STATUS_TICK}
          accessibilityLabel={t("chat.statusSent")}
          name="checkmark"
          size={14}
          color={colors.textOnPrimary}
          style={styles.tickIcon}
        />
      );
    }

    return (
      <Ionicons
        testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.STATUS_TICK}
        accessibilityLabel={t("chat.queuedOffline")}
        name="time-outline"
        size={13}
        color={colors.warning}
        style={styles.tickIcon}
      />
    );
  }
);

MessageStatusTick.displayName = "MessageStatusTick";
