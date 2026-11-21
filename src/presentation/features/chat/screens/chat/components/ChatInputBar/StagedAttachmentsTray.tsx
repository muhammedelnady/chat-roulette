/** @format */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import type { UseUIReturn } from "@/src/presentation/hooks/useUI";

import type { StagedAttachment } from "../../../../shared/types";

import { CHAT_INPUT_BAR_TEST_IDS } from "./ChatInputBar.constants";
import { styles } from "./ChatInputBar.styles";

export interface StagedAttachmentsTrayProps {
  readonly stagedAttachments: readonly StagedAttachment[];
  readonly colors: UseUIReturn["colors"];
  readonly onRemoveStagedAttachment?: (uri: string) => void;
}

export const StagedAttachmentsTray = React.memo(function StagedAttachmentsTray({
  stagedAttachments,
  colors,
  onRemoveStagedAttachment,
}: StagedAttachmentsTrayProps) {
  if (stagedAttachments.length === 0) return null;

  return (
    <View
      testID={CHAT_INPUT_BAR_TEST_IDS.STAGING_TRAY}
      style={[
        styles.stagingTray,
        {
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stagedList}
      >
        {stagedAttachments.map((att) => (
          <View
            key={att.uri}
            testID={CHAT_INPUT_BAR_TEST_IDS.STAGED_ITEM}
            style={styles.stagedItem}
          >
            <Image source={{ uri: att.uri }} style={styles.stagedThumbnail} contentFit="cover" />
            {att.isUploading ? (
              <View
                testID={CHAT_INPUT_BAR_TEST_IDS.UPLOADING_SPINNER}
                style={[styles.stagedOverlay, { backgroundColor: colors.scrim }]}
              >
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
              </View>
            ) : onRemoveStagedAttachment ? (
              <Pressable
                testID={CHAT_INPUT_BAR_TEST_IDS.DISMISS_ATTACHMENT}
                onPress={() => onRemoveStagedAttachment(att.uri)}
                style={({ pressed }) => [
                  styles.dismissBadge,
                  { backgroundColor: colors.scrim },
                  pressed && { opacity: 0.7 },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={14} color={colors.textOnPrimary} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

StagedAttachmentsTray.displayName = "StagedAttachmentsTray";
