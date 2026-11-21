/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { CHAT_EMPTY_STATE_TEST_IDS } from "./ChatEmptyState.constants";
import { styles } from "./ChatEmptyState.styles";
import type { ChatEmptyStateProps } from "./ChatEmptyState.types";

export const ChatEmptyState = memo<ChatEmptyStateProps>(
  ({ title, description, testID = CHAT_EMPTY_STATE_TEST_IDS.ROOT }) => {
    const { colors, t } = useUI();

    const displayTitle = title ?? t("chat.emptyTitle");
    const displayDescription = description ?? t("chat.emptyDescription");

    return (
      <View testID={testID} style={styles.container}>
        <View
          testID={CHAT_EMPTY_STATE_TEST_IDS.ICON_CONTAINER}
          style={[styles.iconWrapper, { backgroundColor: colors.primaryTint }]}
        >
          <Ionicons name="chatbubbles-outline" size={38} color={colors.accent} />
        </View>

        <Text
          testID={CHAT_EMPTY_STATE_TEST_IDS.TITLE}
          variant="lg"
          weight="bold"
          color={colors.textPrimary}
          centered
          style={styles.title}
        >
          {displayTitle}
        </Text>

        <Text
          testID={CHAT_EMPTY_STATE_TEST_IDS.DESCRIPTION}
          variant="sm"
          color={colors.textSecondary}
          centered
        >
          {displayDescription}
        </Text>
      </View>
    );
  }
);

ChatEmptyState.displayName = "ChatEmptyState";
