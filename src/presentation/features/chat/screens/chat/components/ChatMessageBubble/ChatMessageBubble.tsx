/** @format */

import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useMemo, useState } from "react";
import { Linking, View } from "react-native";

import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useHaptics, useUI } from "@/src/presentation/hooks";
import { gradients } from "@/src/presentation/theme";

import type { ChatAttachmentEntity } from "../../../../shared/types";
import { getFirstChar } from "../../../../shared/utils/text";
import { resolveSafeMediaUrl } from "../../../../shared/utils/urlValidator";

import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";
import {
  extractAudioMetadata,
  extractBotOptions,
  formatMessageTimestamp,
  isBotMessage,
  resolvePreviewableImageUrl,
} from "./ChatMessageBubble.helpers";
import { styles } from "./ChatMessageBubble.styles";
import type { ChatMessageBubbleProps } from "./ChatMessageBubble.types";
import { MessageBubbleBody } from "./MessageBubbleBody";
import { MessageReactionsBar } from "./MessageReactionsBar";

export const ChatMessageBubble = memo<ChatMessageBubbleProps>(
  ({
    message,
    isOwn: isOwnProp,
    onSelectFaqOption,
    onRetryMessage,
    onToggleReaction,
    onPreviewImage,
    isFirstInGroup,
    isLastInGroup,
    testID = CHAT_MESSAGE_BUBBLE_TEST_IDS.ROOT,
  }) => {
    const { colors, shadows, spacing, isDark, t } = useUI();
    const haptics = useHaptics();
    const [showPicker, setShowPicker] = useState(false);

    const isBot = isBotMessage(message);
    const botOptions = extractBotOptions(message, isBot);
    const isOwn = isOwnProp ?? (message.senderType === "USER" && !isBot);
    const { isAudio, audioUrl, audioDuration, audioWaveform } = extractAudioMetadata(message);

    const timeStr = useMemo(() => formatMessageTimestamp(message.createdAt), [message.createdAt]);

    const handleAttachmentPress = useCallback(
      (attachment: ChatAttachmentEntity) => {
        const imageUrl = resolvePreviewableImageUrl(attachment);
        if (imageUrl) {
          onPreviewImage?.(imageUrl);
          return;
        }
        const safeFileUrl = resolveSafeMediaUrl(attachment.url, { allowLocal: false });
        if (
          safeFileUrl &&
          (safeFileUrl.startsWith("https://") || safeFileUrl.startsWith("http://"))
        ) {
          void Linking.openURL(safeFileUrl).catch(() => {});
        }
      },
      [onPreviewImage]
    );

    const handleReactionPress = useCallback(
      (emoji: string) => {
        void haptics.selection();
        setShowPicker(false);
        onToggleReaction?.(message.id || message.clientId, emoji);
      },
      [haptics, message.clientId, message.id, onToggleReaction]
    );

    const handleLongPress = useCallback(() => {
      void haptics.light();
      setShowPicker((prev) => !prev);
    }, [haptics]);

    const handleRetryPress = useCallback(() => {
      onRetryMessage?.(message);
    }, [message, onRetryMessage]);

    const reactionEntries = useMemo(
      () => Object.entries(message.reactions ?? {}).filter(([, users]) => users.length > 0),
      [message.reactions]
    );

    const rowAlignment = isOwn ? "flex-end" : "flex-start";
    const hasTail = isLastInGroup !== false;

    if (message.deletedAt) {
      return (
        <View
          testID={testID}
          style={[
            styles.row,
            {
              justifyContent: rowAlignment,
              marginBottom: hasTail ? spacing[10] : spacing[4],
            },
          ]}
        >
          <View
            testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.DELETED_MESSAGE}
            style={[
              styles.bubble,
              styles.deletedBubble,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
            ]}
          >
            <Text variant="sm" color={colors.textSecondary} style={styles.deletedMessageText}>
              {t("chat.messageDeleted")}
            </Text>
          </View>
        </View>
      );
    }

    const bubbleRadiusStyle = {
      borderRadius: 20,
      borderBottomEndRadius: hasTail && isOwn ? 5 : 20,
      borderBottomStartRadius: hasTail && !isOwn ? 5 : 20,
    };

    const ownBubbleGradient = isDark ? gradients.ownBubbleDark : gradients.ownBubbleLight;
    const senderInitial = getFirstChar(message.senderName ?? "P", "P");
    const showRetry = isOwn && message.status === "FAILED" && Boolean(onRetryMessage);

    const bodyNode = (
      <MessageBubbleBody
        message={message}
        isOwn={isOwn}
        isBot={isBot}
        botOptions={botOptions}
        isAudio={isAudio}
        audioUrl={audioUrl}
        audioDuration={audioDuration}
        audioWaveform={audioWaveform}
        timeStr={timeStr}
        onPressAttachment={handleAttachmentPress}
        onSelectFaqOption={onSelectFaqOption}
        onRetryPress={handleRetryPress}
        showRetry={showRetry}
      />
    );

    return (
      <View
        testID={testID}
        style={[
          styles.row,
          {
            justifyContent: rowAlignment,
            marginBottom: hasTail ? spacing[12] : spacing[4],
          },
        ]}
      >
        <View style={styles.bubbleColumn}>
          {!isOwn && message.senderName && isFirstInGroup !== false ? (
            <View style={styles.senderRow}>
              <View
                style={[
                  styles.senderAvatarBadge,
                  { backgroundColor: isBot ? colors.accentTint : colors.primaryTint },
                ]}
              >
                <Text
                  variant="xs"
                  weight="bold"
                  color={isBot ? colors.accent : colors.primary}
                  style={styles.senderInitialText}
                >
                  {senderInitial}
                </Text>
              </View>
              <Text
                variant="xs"
                weight="bold"
                color={isBot ? colors.accent : colors.primary}
                style={styles.senderLabel}
              >
                {message.senderName}
              </Text>
            </View>
          ) : null}

          <AnimatedPressable
            onLongPress={handleLongPress}
            accessibilityHint={t("chat.reactionsHint")}
            scaleTo={0.985}
            testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.BUBBLE}
            style={[
              styles.bubbleShell,
              shadows.sm,
              bubbleRadiusStyle,
              isOwn
                ? [styles.ownBubbleShell, { backgroundColor: colors.primary }]
                : {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: isBot ? colors.accentBorder : colors.border,
                  },
            ]}
          >
            <View style={[styles.bubbleClip, bubbleRadiusStyle]}>
              {isOwn ? (
                <LinearGradient
                  colors={ownBubbleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bubble}
                >
                  {bodyNode}
                </LinearGradient>
              ) : (
                <View style={styles.bubble}>{bodyNode}</View>
              )}
            </View>
          </AnimatedPressable>

          <MessageReactionsBar
            reactionEntries={reactionEntries}
            showPicker={showPicker}
            isOwn={isOwn}
            onReactionPress={handleReactionPress}
          />
        </View>
      </View>
    );
  }
);

ChatMessageBubble.displayName = "ChatMessageBubble";
