/** @format */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import { View } from "react-native";

import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import type { ChatAttachmentEntity } from "../../../../shared/types";
import { isPreviewableImageUrl, resolveSafeMediaUrl } from "../../../../shared/utils/urlValidator";

import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";
import { styles } from "./ChatMessageBubble.styles";

export interface MessageAttachmentsListProps {
  readonly attachments: readonly ChatAttachmentEntity[];
  readonly messageId?: string;
  readonly clientId?: string;
  readonly isOwn: boolean;
  readonly onPressAttachment: (attachment: ChatAttachmentEntity) => void;
}

export function resolveAttachmentUrl(url: string): string {
  return resolveSafeMediaUrl(url, { allowLocal: true });
}

export const MessageAttachmentsList = memo<MessageAttachmentsListProps>(
  ({ attachments, messageId, clientId, isOwn, onPressAttachment }) => {
    const { colors, t } = useUI();

    if (attachments.length === 0) {
      return null;
    }

    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map((att, idx) => {
          const attId = typeof att.id === "string" ? att.id : "";
          const attUploadId = typeof att.uploadId === "string" ? att.uploadId : "";
          const attUrl = typeof att.url === "string" ? att.url : "";
          const itemKey =
            attId.length > 0
              ? attId
              : attUploadId.length > 0
                ? attUploadId
                : attUrl.length > 0
                  ? attUrl
                  : `att-${messageId ?? clientId ?? ""}-${idx}`;

          if (att.deletedAt) {
            return (
              <View
                key={itemKey}
                testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.DELETED_ATTACHMENT}
                style={[styles.deletedAttachmentBox, { backgroundColor: colors.primaryTint }]}
              >
                <Ionicons
                  name="trash-outline"
                  size={14}
                  color={isOwn ? colors.textOnPrimary : colors.textSecondary}
                />
                <Text
                  variant="xs"
                  color={isOwn ? colors.textOnPrimary : colors.textSecondary}
                  style={styles.deletedAttachmentText}
                >
                  {t("chat.attachmentRemoved")}
                </Text>
              </View>
            );
          }

          const resolvedUrl = resolveSafeMediaUrl(attUrl, { allowLocal: isOwn });
          const isImg = Boolean(resolvedUrl && isPreviewableImageUrl(resolvedUrl, att.mimeType));

          if (isImg) {
            return (
              <AnimatedPressable
                key={itemKey}
                testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.ATTACHMENT_IMAGE}
                accessibilityRole="button"
                accessibilityLabel={att.fileName || t("chat.openAttachment")}
                scaleTo={0.98}
                onPress={() => onPressAttachment(att)}
                style={[styles.imageWrapper, { borderColor: colors.borderSubtle }]}
              >
                {resolvedUrl ? (
                  <Image
                    source={{ uri: resolvedUrl }}
                    recyclingKey={resolvedUrl}
                    style={styles.attachmentImage}
                    contentFit="cover"
                    transition={150}
                  />
                ) : null}
              </AnimatedPressable>
            );
          }

          const sizeLabel =
            att.fileSize > 0 ? `${Math.max(1, Math.round(att.fileSize / 1024))} KB` : "";

          return (
            <AnimatedPressable
              key={itemKey}
              testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.ATTACHMENT_FILE}
              accessibilityRole="button"
              accessibilityLabel={att.fileName || t("chat.openAttachment")}
              scaleTo={0.98}
              onPress={() => onPressAttachment(att)}
              style={[
                styles.fileCard,
                {
                  backgroundColor: isOwn ? colors.primaryTint : colors.surfaceElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View
                style={[
                  styles.fileIconMedallion,
                  { backgroundColor: isOwn ? colors.primaryTint2 : colors.primaryTint },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={isOwn ? colors.textOnPrimary : colors.primary}
                />
              </View>
              <View style={styles.fileInfo}>
                <Text
                  variant="xs"
                  color={isOwn ? colors.textOnPrimary : colors.textPrimary}
                  numberOfLines={1}
                  weight="medium"
                >
                  {att.fileName || t("chat.attachmentDefaultName")}
                </Text>
                <Text
                  variant="xs"
                  color={isOwn ? colors.textOnPrimary : colors.textSecondary}
                  style={styles.fileSizeText}
                >
                  {sizeLabel}
                </Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>
    );
  }
);

MessageAttachmentsList.displayName = "MessageAttachmentsList";
