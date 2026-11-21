/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { View } from "react-native";

import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import type { ChatAttachmentEntity, ChatMessageEntity } from "../../../../shared/types";
import { AudioMessageBubble } from "../AudioMessageBubble";

import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";
import { styles } from "./ChatMessageBubble.styles";
import { MessageAttachmentsList } from "./MessageAttachmentsList";
import { type BotOptionItem, MessageBotOptions } from "./MessageBotOptions";
import { MessageStatusTick } from "./MessageStatusTick";

interface MessageBubbleBodyProps {
  readonly message: ChatMessageEntity;
  readonly isOwn: boolean;
  readonly isBot: boolean;
  readonly botOptions: readonly BotOptionItem[] | null;
  readonly isAudio: boolean;
  readonly audioUrl: string | undefined;
  readonly audioDuration: number | undefined;
  readonly audioWaveform: readonly number[] | undefined;
  readonly timeStr: string;
  readonly onPressAttachment: (attachment: ChatAttachmentEntity) => void;
  readonly onSelectFaqOption?: (query: string) => void;
  readonly onRetryPress?: () => void;
  readonly showRetry: boolean;
}

export const MessageBubbleBody = memo<MessageBubbleBodyProps>(
  ({
    message,
    isOwn,
    isBot,
    botOptions,
    isAudio,
    audioUrl,
    audioDuration,
    audioWaveform,
    timeStr,
    onPressAttachment,
    onSelectFaqOption,
    onRetryPress,
    showRetry,
  }) => {
    const { colors, t } = useUI();

    return (
      <>
        {isBot ? (
          <View
            testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.BOT_BADGE}
            style={[
              styles.botBadgeRow,
              {
                backgroundColor: colors.accentTint,
                borderColor: colors.accentBorder,
              },
            ]}
          >
            <Ionicons name="sparkles" size={12} color={colors.accent} />
            <Text variant="xs" weight="bold" color={colors.accent}>
              {t("chat.faq.botTitle")}
            </Text>
          </View>
        ) : null}

        <MessageAttachmentsList
          attachments={message.attachments}
          messageId={message.id}
          clientId={message.clientId}
          isOwn={isOwn}
          onPressAttachment={onPressAttachment}
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
              color={isOwn ? colors.textOnPrimary : colors.textMuted}
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

        {showRetry && onRetryPress ? (
          <AnimatedPressable
            testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.RETRY_PRESSABLE}
            accessibilityRole="button"
            accessibilityLabel={t("chat.tapToRetry")}
            scaleTo={0.95}
            onPress={onRetryPress}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            style={[
              styles.retryRow,
              {
                backgroundColor: colors.errorTint,
                borderColor: colors.errorBorder,
              },
            ]}
          >
            <Ionicons name="refresh" size={12} color={colors.textOnPrimary} />
            <Text variant="xs" weight="bold" color={colors.textOnPrimary}>
              {t("chat.tapToRetry")}
            </Text>
          </AnimatedPressable>
        ) : null}
      </>
    );
  }
);

MessageBubbleBody.displayName = "MessageBubbleBody";
