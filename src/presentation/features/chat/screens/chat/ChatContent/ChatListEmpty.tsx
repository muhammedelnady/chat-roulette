/** @format */

import { memo } from "react";
import { ActivityIndicator, View } from "react-native";

import { Button, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import type { ChatMessageEntity } from "../../../shared/types";
import { ChatEmptyState } from "../components";

import { CHAT_CONTENT_TEST_IDS } from "./ChatContent.constants";
import { styles } from "./ChatContent.styles";

export interface GroupedMessageRow {
  readonly message: ChatMessageEntity;
  readonly isFirstInGroup: boolean;
  readonly isLastInGroup: boolean;
}

export function getSenderGroupKey(msg?: ChatMessageEntity): string {
  if (!msg) return "";
  return `${msg.senderType}:${msg.senderId ?? msg.senderName ?? ""}`;
}

interface ChatListEmptyProps {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: string | null;
  readonly onRetry: () => void;
}

export const ChatListEmpty = memo<ChatListEmptyProps>(({ isLoading, isError, error, onRetry }) => {
  const { colors, t } = useUI();

  if (isLoading) {
    return (
      <View testID={CHAT_CONTENT_TEST_IDS.LOADING_SPINNER} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.errorCard}>
          <Text variant="md" weight="bold" color={colors.error} centered>
            {t("chat.loadFailed")}
          </Text>
          {error ? (
            <Text variant="xs" color={colors.textSecondary} centered>
              {error}
            </Text>
          ) : null}
          <Button label={t("common.retry")} onPress={onRetry} size="sm" variant="outline" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <ChatEmptyState testID={CHAT_CONTENT_TEST_IDS.EMPTY_STATE} />
    </View>
  );
});

ChatListEmpty.displayName = "ChatListEmpty";
