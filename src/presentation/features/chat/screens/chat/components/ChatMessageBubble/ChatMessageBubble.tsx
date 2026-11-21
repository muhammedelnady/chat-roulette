/** @format */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { memo, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { CHAT_CONSTANTS } from "../../../../shared/constants";
import type { ChatAttachmentEntity } from "../../../../shared/types";
import { AudioMessageBubble } from "../AudioMessageBubble";

import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";
import { styles } from "./ChatMessageBubble.styles";
import type { ChatMessageBubbleProps } from "./ChatMessageBubble.types";
import { MessageAttachmentsList, resolveAttachmentUrl } from "./MessageAttachmentsList";
import { type BotOptionItem, MessageBotOptions } from "./MessageBotOptions";
import { MessageImageLightbox } from "./MessageImageLightbox";
import { MessageStatusTick } from "./MessageStatusTick";

export const ChatMessageBubble = memo<ChatMessageBubbleProps>(
  ({
    message,
    isOwn: isOwnProp,
    onSelectFaqOption,
    onRetryMessage,
    onToggleReaction,
    isLastInGroup,
    testID = CHAT_MESSAGE_BUBBLE_TEST_IDS.ROOT,
  }) => {
    const { colors, spacing, t } = useUI();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    const isBot =
      message.senderType === "BOT" ||
      Boolean(
        message.metadata &&
        typeof message.metadata === "object" &&
        "isBotGreeting" in message.metadata &&
        message.metadata["isBotGreeting"] === true
      );

    const botOptions: BotOptionItem[] | null =
      isBot &&
      message.metadata &&
      typeof message.metadata === "object" &&
      "options" in message.metadata &&
      Array.isArray(message.metadata["options"])
        ? (message.metadata["options"] as BotOptionItem[])
        : null;

    const isOwn = isOwnProp ?? (message.senderType === "USER" && !isBot);
    const isAudio =
      message.contentType === "AUDIO" ||
      Boolean(
        message.metadata && typeof message.metadata === "object" && "audioUrl" in message.metadata
      );

    const audioMetadata =
      isAudio && message.metadata && typeof message.metadata === "object"
        ? (message.metadata as {
            audioUrl?: string;
            duration?: number;
            waveform?: number[];
          })
        : null;

    const audioUrl = audioMetadata?.audioUrl ?? message.content ?? "";
    const audioDuration = audioMetadata?.duration ?? 0;
    const audioWaveform = audioMetadata?.waveform;

    const timeStr = useMemo(() => {
      const d = new Date(message.createdAt);
      if (isNaN(d.getTime())) return "";
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    }, [message.createdAt]);

    const handleAttachmentPress = (attachment: ChatAttachmentEntity) => {
      if (attachment.deletedAt) return;
      const mime = attachment.mimeType || "";
      const resolvedUrl = resolveAttachmentUrl(attachment.url);
      const isImg =
        mime.startsWith("image/") ||
        (resolvedUrl && /\.(jpg|jpeg|png|webp|gif)/i.test(resolvedUrl));
      if (isImg && resolvedUrl) {
        setSelectedImage(resolvedUrl);
      }
    };

    const handleReactionPress = (emoji: string) => {
      void Haptics.selectionAsync();
      setShowPicker(false);
      onToggleReaction?.(message.id || message.clientId, emoji);
    };

    if (message.deletedAt) {
      return (
        <View
          testID={testID}
          style={[
            styles.row,
            {
              justifyContent: isOwn ? "flex-end" : "flex-start",
              marginBottom: isLastInGroup !== false ? spacing[10] : spacing[4],
            },
          ]}
        >
          <View
            testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.DELETED_MESSAGE}
            style={[styles.bubble, { backgroundColor: colors.border, borderRadius: 16 }]}
          >
            <Text variant="sm" color={colors.textSecondary} style={styles.deletedMessageText}>
              [Message deleted]
            </Text>
          </View>
        </View>
      );
    }

    const reactionEntries = Object.entries(message.reactions ?? {}).filter(
      ([, users]) => users.length > 0
    );

    return (
      <>
        <View
          testID={testID}
          style={[
            styles.row,
            {
              justifyContent: isOwn ? "flex-end" : "flex-start",
              marginBottom: isLastInGroup !== false ? spacing[12] : spacing[4],
            },
          ]}
        >
          <View style={styles.bubbleColumn}>
            {!isOwn && message.senderName ? (
              <Text variant="xs" weight="bold" color={colors.accent} style={styles.senderLabel}>
                {message.senderName}
              </Text>
            ) : null}

            <Pressable
              onLongPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowPicker((prev) => !prev);
              }}
              testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.BUBBLE}
              style={[
                styles.bubble,
                {
                  backgroundColor: isOwn ? colors.ownBubble : colors.surfaceElevated,
                  borderRadius: 18,
                  borderBottomRightRadius: isOwn && isLastInGroup !== false ? 4 : 18,
                  borderBottomLeftRadius: !isOwn && isLastInGroup !== false ? 4 : 18,
                  borderWidth: isOwn ? 0 : 1,
                  borderColor: colors.borderStrong,
                },
              ]}
            >
              {isBot && (
                <View testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.BOT_BADGE} style={styles.botBadgeRow}>
                  <Ionicons name="sparkles" size={13} color={colors.accent} />
                  <Text variant="xs" weight="bold" color={colors.accent}>
                    {t("chat.faq.botTitle")}
                  </Text>
                </View>
              )}

              <MessageAttachmentsList
                attachments={message.attachments}
                messageId={message.id}
                clientId={message.clientId}
                isOwn={isOwn}
                onPressAttachment={handleAttachmentPress}
              />

              {isAudio && audioUrl ? (
                <AudioMessageBubble
                  audioUrl={audioUrl}
                  durationSeconds={audioDuration}
                  waveformBars={audioWaveform}
                  isOwn={isOwn}
                />
              ) : null}

              {message.content && (!isAudio || message.content !== audioUrl) ? (
                <Text
                  testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.TEXT}
                  variant="base"
                  color={isOwn ? colors.textOnPrimary : colors.textPrimary}
                  style={styles.messageTextAuto}
                >
                  {message.content}
                </Text>
              ) : null}

              {isBot && botOptions && botOptions.length > 0 ? (
                <MessageBotOptions options={botOptions} onSelectOption={onSelectFaqOption} />
              ) : null}

              <View style={styles.footer}>
                {timeStr ? (
                  <Text
                    testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.TIME}
                    variant="xs"
                    color={isOwn ? colors.textOnPrimary : colors.textSecondary}
                    style={styles.editedLabelText}
                  >
                    {timeStr}
                  </Text>
                ) : null}
                <MessageStatusTick
                  isOwn={isOwn}
                  status={message.status}
                  readReceipts={message.readReceipts}
                />
              </View>

              {isOwn && message.status === "FAILED" && onRetryMessage ? (
                <Pressable
                  testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.RETRY_PRESSABLE}
                  onPress={() => onRetryMessage(message)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.retryRow}
                >
                  <Ionicons name="refresh" size={12} color={colors.textOnPrimary} />
                  <Text variant="xs" color={colors.textOnPrimary}>
                    {t("chat.tapToRetry")}
                  </Text>
                </Pressable>
              ) : null}
            </Pressable>

            {reactionEntries.length > 0 || showPicker ? (
              <View style={styles.reactionsRow}>
                {reactionEntries.map(([emoji, users]) => {
                  const isMine = users.includes("you");
                  return (
                    <Pressable
                      key={emoji}
                      testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.REACTION_PILL(emoji)}
                      onPress={() => handleReactionPress(emoji)}
                      style={({ pressed }) => [
                        styles.reactionPill,
                        {
                          backgroundColor: isMine ? colors.primaryTint : colors.surface,
                          borderColor: isMine ? colors.primary : colors.borderStrong,
                        },
                        pressed && { opacity: 0.75 },
                      ]}
                    >
                      <Text variant="xs">
                        {emoji} {users.length}
                      </Text>
                    </Pressable>
                  );
                })}
                {showPicker ? (
                  <View style={styles.quickReactRow}>
                    {CHAT_CONSTANTS.REACTION_EMOJIS.map((emoji) => (
                      <Pressable
                        key={emoji}
                        onPress={() => handleReactionPress(emoji)}
                        style={({ pressed }) => [
                          styles.quickReactBtn,
                          {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.borderStrong,
                          },
                          pressed && { opacity: 0.75 },
                        ]}
                      >
                        <Text variant="xs">{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <MessageImageLightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      </>
    );
  }
);

ChatMessageBubble.displayName = "ChatMessageBubble";
