/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { ActivityIndicator, Alert, Pressable, TextInput, View } from "react-native";

import { useUI, useVoiceRecording } from "@/src/presentation/hooks";

import { AudioRecordingTray } from "./AudioRecordingTray";
import { CHAT_INPUT_BAR_TEST_IDS } from "./ChatInputBar.constants";
import { styles } from "./ChatInputBar.styles";
import type { ChatInputBarProps } from "./ChatInputBar.types";
import { StagedAttachmentsTray } from "./StagedAttachmentsTray";

export const ChatInputBar = memo<ChatInputBarProps>(
  ({
    inputText,
    onChangeText,
    onSend,
    onSendAudioNote,
    onPickAttachment,
    onRemoveStagedAttachment,
    stagedAttachments = [],
    isSending = false,
    disabled = false,
    placeholder,
    testID = CHAT_INPUT_BAR_TEST_IDS.ROOT,
  }) => {
    const { colors, t, isRTL } = useUI();
    const {
      isRecording,
      formattedTime,
      durationMs,
      startRecording,
      stopRecording,
      cancelRecording,
    } = useVoiceRecording();

    const handleStartRecording = useCallback(async () => {
      if (!onSendAudioNote || disabled || isSending) return;
      const started = await startRecording();
      if (!started) {
        Alert.alert(t("chat.micPermissionDenied"));
      }
    }, [onSendAudioNote, disabled, isSending, startRecording, t]);

    const handleCancelRecording = useCallback(() => {
      void cancelRecording();
    }, [cancelRecording]);

    const handleSendRecording = useCallback(async () => {
      if (durationMs < 1000) {
        Alert.alert(t("chat.recordingTooShort"));
        await cancelRecording();
        return;
      }
      const voiceNote = await stopRecording();
      if (!voiceNote) return;

      void onSendAudioNote?.({
        uri: voiceNote.uri,
        duration: Math.round(voiceNote.durationMs / 1000),
        name: `voice_${voiceNote.createdAt}.m4a`,
        type: voiceNote.mimeType,
      });
    }, [durationMs, stopRecording, cancelRecording, onSendAudioNote, t]);

    const handleMicPress = useCallback(() => {
      void handleStartRecording();
    }, [handleStartRecording]);

    const hasUploading = stagedAttachments.some((att) => att.isUploading);
    const hasText = inputText.trim().length > 0;
    const hasAttachments = stagedAttachments.length > 0;
    const canSend = (hasText || hasAttachments) && !hasUploading && !isSending && !disabled;
    const showMicButton = !hasText && !hasAttachments && Boolean(onSendAudioNote);

    const handleSendPress = useCallback(() => {
      if (!canSend) return;
      onSend(inputText.trim());
    }, [canSend, inputText, onSend]);

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <StagedAttachmentsTray
          stagedAttachments={stagedAttachments}
          colors={colors}
          onRemoveStagedAttachment={onRemoveStagedAttachment}
        />

        <View style={[styles.inputRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {isRecording ? (
            <AudioRecordingTray
              formattedRecordingTime={formattedTime}
              onCancelRecording={handleCancelRecording}
              onSendRecording={() => {
                void handleSendRecording();
              }}
              colors={colors}
              isRTL={isRTL}
              t={t}
            />
          ) : (
            <>
              {onPickAttachment ? (
                <Pressable
                  testID={CHAT_INPUT_BAR_TEST_IDS.ATTACH_BUTTON}
                  onPress={onPickAttachment}
                  disabled={disabled || isSending}
                  style={({ pressed }) => [
                    styles.attachButton,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.borderStrong,
                      [isRTL ? "marginLeft" : "marginRight"]: 8,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="attach-outline" size={20} color={colors.accent} />
                </Pressable>
              ) : null}

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.borderStrong,
                  },
                ]}
              >
                <TextInput
                  testID={CHAT_INPUT_BAR_TEST_IDS.INPUT}
                  value={inputText}
                  onChangeText={onChangeText}
                  placeholder={placeholder ?? t("chat.inputPlaceholder")}
                  placeholderTextColor={colors.textPlaceholder}
                  editable={!disabled && !isSending}
                  multiline
                  maxLength={2000}
                  style={[
                    styles.input,
                    {
                      color: colors.textPrimary,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                />
              </View>

              {showMicButton ? (
                <Pressable
                  testID={CHAT_INPUT_BAR_TEST_IDS.RECORD_BUTTON}
                  accessibilityLabel={t("chat.recordVoiceNote")}
                  onPress={handleMicPress}
                  disabled={disabled || isSending}
                  style={({ pressed }) => [
                    styles.sendButton,
                    {
                      backgroundColor: colors.primary,
                      [isRTL ? "marginRight" : "marginLeft"]: 8,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="mic-outline" size={20} color={colors.textOnPrimary} />
                </Pressable>
              ) : (
                <Pressable
                  testID={CHAT_INPUT_BAR_TEST_IDS.SEND_BUTTON}
                  onPress={handleSendPress}
                  disabled={!canSend}
                  style={({ pressed }) => [
                    styles.sendButton,
                    {
                      backgroundColor: canSend ? colors.primary : colors.surfaceElevated,
                      [isRTL ? "marginRight" : "marginLeft"]: 8,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color={colors.textOnPrimary} />
                  ) : (
                    <Ionicons
                      name={isRTL ? "arrow-back" : "arrow-up"}
                      size={20}
                      color={canSend ? colors.textOnPrimary : colors.textSecondary}
                    />
                  )}
                </Pressable>
              )}
            </>
          )}
        </View>
      </View>
    );
  }
);

ChatInputBar.displayName = "ChatInputBar";
