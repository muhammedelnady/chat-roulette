/** @format */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import type { ChatAttachmentEntity } from "../../../../shared/types";

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
  if (!url) return "";
  if (url.startsWith("/")) {
    const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000")
      .replace(/\/api\/v1$/, "")
      .replace(/\/$/, "");
    return `${baseUrl}${url}`;
  }
  return url;
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

          const mime = att.mimeType || "";
          const resolvedUrl = resolveAttachmentUrl(attUrl);
          const isImg =
            mime.startsWith("image/") ||
            (resolvedUrl && /\.(jpg|jpeg|png|webp|gif)/i.test(resolvedUrl));

          if (isImg) {
            return (
              <Pressable
                key={itemKey}
                testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.ATTACHMENT_IMAGE}
                onPress={() => onPressAttachment(att)}
                style={({ pressed }) => [styles.imageWrapper, pressed && { opacity: 0.85 }]}
              >
                {resolvedUrl ? (
                  <Image
                    source={{ uri: resolvedUrl }}
                    style={styles.attachmentImage}
                    contentFit="cover"
                    transition={150}
                  />
                ) : null}
              </Pressable>
            );
          }

          return (
            <Pressable
              key={itemKey}
              testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.ATTACHMENT_FILE}
              onPress={() => onPressAttachment(att)}
              style={({ pressed }) => [
                styles.fileCard,
                { backgroundColor: colors.primaryTint },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={isOwn ? colors.textOnPrimary : colors.primary}
              />
              <View style={styles.fileInfo}>
                <Text
                  variant="xs"
                  color={isOwn ? colors.textOnPrimary : colors.textPrimary}
                  numberOfLines={1}
                  weight="medium"
                >
                  {att.fileName || "Attachment"}
                </Text>
                <Text
                  variant="xs"
                  color={isOwn ? colors.textOnPrimary : colors.textSecondary}
                  style={styles.fileSizeText}
                >
                  {att.fileSize ? `${Math.round(att.fileSize / 1024)} KB` : ""}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }
);

MessageAttachmentsList.displayName = "MessageAttachmentsList";
