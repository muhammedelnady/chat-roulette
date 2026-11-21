/** @format */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";

import { AnimatedPressable } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import {
  FADE_DOWN_ENTER,
  FADE_DOWN_EXIT,
  LIST_ITEM_REFLOW,
  SOFT_POP_ENTER,
  SOFT_POP_EXIT,
} from "@/src/presentation/theme";

import type { StagedAttachment } from "../../../../shared/types";

import { CHAT_INPUT_BAR_TEST_IDS } from "./ChatInputBar.constants";
import { styles } from "./ChatInputBar.styles";

export interface StagedAttachmentsTrayProps {
  readonly stagedAttachments: readonly StagedAttachment[];
  readonly colors: ReturnType<typeof useUI>["colors"];
  readonly onRemoveStagedAttachment?: (idOrUri: string) => void;
}

export const StagedAttachmentsTray = React.memo(function StagedAttachmentsTray({
  stagedAttachments,
  colors,
  onRemoveStagedAttachment,
}: StagedAttachmentsTrayProps) {
  const { t } = useUI();
  if (stagedAttachments.length === 0) return null;

  return (
    <Animated.View
      testID={CHAT_INPUT_BAR_TEST_IDS.STAGING_TRAY}
      entering={FADE_DOWN_ENTER}
      exiting={FADE_DOWN_EXIT}
      style={[
        styles.stagingTray,
        {
          borderBottomColor: colors.borderSubtle,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.stagedList}
      >
        {stagedAttachments.map((att) => {
          const itemKey = att.localId ?? att.uri;
          return (
            <Animated.View
              key={itemKey}
              testID={CHAT_INPUT_BAR_TEST_IDS.STAGED_ITEM}
              entering={SOFT_POP_ENTER}
              exiting={SOFT_POP_EXIT}
              layout={LIST_ITEM_REFLOW}
              style={[styles.stagedItem, { borderColor: colors.borderSubtle }]}
            >
              <Image source={{ uri: att.uri }} style={styles.stagedThumbnail} contentFit="cover" />
              {att.isUploading ? (
                <View
                  testID={CHAT_INPUT_BAR_TEST_IDS.UPLOADING_SPINNER}
                  style={[styles.stagedOverlay, { backgroundColor: colors.scrim }]}
                >
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                </View>
              ) : null}
              {onRemoveStagedAttachment ? (
                <AnimatedPressable
                  testID={CHAT_INPUT_BAR_TEST_IDS.DISMISS_ATTACHMENT}
                  accessibilityRole="button"
                  accessibilityLabel={t("chat.removeAttachment")}
                  scaleTo={0.94}
                  onPress={() => onRemoveStagedAttachment(itemKey)}
                  containerStyle={styles.dismissBadgeContainer}
                  style={[styles.dismissBadge, { backgroundColor: colors.scrim }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={14} color={colors.textOnPrimary} />
                </AnimatedPressable>
              ) : null}
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
});

StagedAttachmentsTray.displayName = "StagedAttachmentsTray";
