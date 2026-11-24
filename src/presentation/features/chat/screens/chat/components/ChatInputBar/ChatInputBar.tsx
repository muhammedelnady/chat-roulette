/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";

import { AnimatedPressable } from "@/src/presentation/components/atoms";
import { useHaptics, useUI, useVoiceRecording } from "@/src/presentation/hooks";
import {
  CSS_EASE_OUT,
  gradients,
  MOTION_DURATION,
  SOFT_POP_ENTER,
  SOFT_POP_EXIT,
} from "@/src/presentation/theme";

import { CHAT_CONSTANTS } from "../../../../shared/constants";
import type { StagedAttachment } from "../../../../shared/types";

import { AudioRecordingTray } from "./AudioRecordingTray";
import { CHAT_INPUT_BAR_TEST_IDS } from "./ChatInputBar.constants";
import { styles } from "./ChatInputBar.styles";
import type { ChatInputBarProps } from "./ChatInputBar.types";
import { StagedAttachmentsTray } from "./StagedAttachmentsTray";

const SEND_BUTTON_TRANSITION = ["transform", "opacity", "backgroundColor", "borderColor"] as const;
const EMPTY_STAGED_ATTACHMENTS: readonly StagedAttachment[] = [];

export const ChatInputBar = memo<ChatInputBarProps>(
  ({
    inputText,
    onChangeText,
    onSend,
    onSendAudioNote,
    onPickAttachment,
    onRemoveStagedAttachment,
    stagedAttachments = EMPTY_STAGED_ATTACHMENTS,
    isSending = false,
    disabled = false,
    placeholder,
    testID = CHAT_INPUT_BAR_TEST_IDS.ROOT,
  }) => {
    const { colors, shadows, t, isRTL, isDark } = useUI();
    const haptics = useHaptics();
    const [isFocused, setIsFocused] = useState(false);
    const recordingLockRef = useRef(false);

    const {
      isRecording,
      formattedTime,
      durationMs,
      startRecording,
      stopRecording,
      cancelRecording,
    } = useVoiceRecording();

    const handleStartRecording = useCallback(async () => {
      if (!onSendAudioNote || disabled || isSending || recordingLockRef.current) return;
      recordingLockRef.current = true;
      try {
        const started = await startRecording();
        if (!started) {
          Alert.alert(t("chat.micPermissionDenied"));
        }
      } finally {
        recordingLockRef.current = false;
      }
    }, [onSendAudioNote, disabled, isSending, startRecording, t]);

    const handleCancelRecording = useCallback(() => {
      void haptics.selection();
      void cancelRecording();
    }, [cancelRecording, haptics]);

    const handleSendRecording = useCallback(async () => {
      if (recordingLockRef.current) return;
      recordingLockRef.current = true;
      try {
        if (durationMs < 1000) {
          Alert.alert(t("chat.recordingTooShort"));
          await cancelRecording();
          return;
        }
        void haptics.light();
        const voiceNote = await stopRecording();
        if (!voiceNote) return;

        await onSendAudioNote?.({
          uri: voiceNote.uri,
          duration: Math.round(voiceNote.durationMs / 1000),
          name: `voice_${voiceNote.createdAt}.m4a`,
          type: voiceNote.mimeType,
        });
      } finally {
        recordingLockRef.current = false;
      }
    }, [durationMs, stopRecording, cancelRecording, onSendAudioNote, haptics, t]);

    const handleMicPress = useCallback(() => {
      void haptics.light();
      void handleStartRecording();
    }, [handleStartRecording, haptics]);

    const handleSendRecordingPress = useCallback(() => {
      void handleSendRecording();
    }, [handleSendRecording]);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    const hasUploading = stagedAttachments.some((att) => att.isUploading);
    const hasText = inputText.trim().length > 0;
    const hasAttachments = stagedAttachments.length > 0;
    const canSend = (hasText || hasAttachments) && !hasUploading && !isSending && !disabled;
    const showMicButton = !hasText && !hasAttachments && Boolean(onSendAudioNote) && !disabled;

    const handleSendPress = useCallback(() => {
      if (!canSend) return;
      void haptics.light();
      onSend(inputText.trim());
    }, [canSend, haptics, inputText, onSend]);

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        <StagedAttachmentsTray
          stagedAttachments={stagedAttachments}
          colors={colors}
          onRemoveStagedAttachment={onRemoveStagedAttachment}
        />

        <View style={styles.inputRow}>
          {isRecording ? (
            <AudioRecordingTray
              formattedRecordingTime={formattedTime}
              onCancelRecording={handleCancelRecording}
              onSendRecording={handleSendRecordingPress}
              colors={colors}
              shadows={shadows}
              t={t}
            />
          ) : (
            <>
              {onPickAttachment ? (
                <AnimatedPressable
                  testID={CHAT_INPUT_BAR_TEST_IDS.ATTACH_BUTTON}
                  accessibilityRole="button"
                  accessibilityLabel={t("chat.attachImage")}
                  scaleTo={0.95}
                  onPress={onPickAttachment}
                  disabled={disabled || isSending}
                  style={[
                    styles.attachButton,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      opacity: disabled || isSending ? 0.45 : 1,
                    },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="attach-outline" size={20} color={colors.accent} />
                </AnimatedPressable>
              ) : null}

              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: isFocused ? colors.borderFocused : colors.border,
                    transitionProperty: "borderColor",
                    transitionDuration: MOTION_DURATION.micro,
                    transitionTimingFunction: CSS_EASE_OUT,
                  },
                ]}
              >
                <TextInput
                  testID={CHAT_INPUT_BAR_TEST_IDS.INPUT}
                  accessibilityLabel={t("chat.inputPlaceholder")}
                  keyboardAppearance={isDark ? "dark" : "light"}
                  value={inputText}
                  onChangeText={onChangeText}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={placeholder ?? t("chat.inputPlaceholder")}
                  placeholderTextColor={colors.textPlaceholder}
                  editable={!disabled && !isSending}
                  multiline
                  maxLength={CHAT_CONSTANTS.MAX_INPUT_LENGTH}
                  style={[
                    styles.input,
                    {
                      color: colors.textPrimary,
                      textAlign: isRTL ? "right" : "left",
                      writingDirection: isRTL ? "rtl" : "ltr",
                    },
                  ]}
                />
              </Animated.View>

              {showMicButton ? (
                <Animated.View key="mic-action" entering={SOFT_POP_ENTER} exiting={SOFT_POP_EXIT}>
                  <AnimatedPressable
                    testID={CHAT_INPUT_BAR_TEST_IDS.RECORD_BUTTON}
                    accessibilityRole="button"
                    accessibilityLabel={t("chat.recordVoiceNote")}
                    scaleTo={0.95}
                    onPress={handleMicPress}
                    disabled={isSending}
                    style={[styles.sendButton, shadows.glowPrimary]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <LinearGradient
                      colors={gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientActionFill}
                    >
                      <Ionicons name="mic-outline" size={20} color={colors.textOnPrimary} />
                    </LinearGradient>
                  </AnimatedPressable>
                </Animated.View>
              ) : (
                <Animated.View key="send-action" entering={SOFT_POP_ENTER} exiting={SOFT_POP_EXIT}>
                  <AnimatedPressable
                    testID={CHAT_INPUT_BAR_TEST_IDS.SEND_BUTTON}
                    accessibilityRole="button"
                    accessibilityLabel={t("chat.sendMessageAction")}
                    scaleTo={0.95}
                    transitionProperties={SEND_BUTTON_TRANSITION}
                    transitionDurationMs={MOTION_DURATION.micro}
                    onPress={handleSendPress}
                    disabled={!canSend}
                    style={[
                      styles.sendButton,
                      canSend ? shadows.glowPrimary : null,
                      {
                        backgroundColor: canSend ? "transparent" : colors.surfaceElevated,
                        borderWidth: canSend ? 0 : 1,
                        borderColor: colors.border,
                      },
                    ]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {canSend ? (
                      <LinearGradient
                        colors={gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientActionFill}
                      >
                        <Ionicons name="arrow-up" size={20} color={colors.textOnPrimary} />
                      </LinearGradient>
                    ) : isSending ? (
                      <ActivityIndicator size="small" color={colors.textSecondary} />
                    ) : (
                      <Ionicons name="arrow-up" size={20} color={colors.textMuted} />
                    )}
                  </AnimatedPressable>
                </Animated.View>
              )}
            </>
          )}
        </View>
      </View>
    );
  }
);

ChatInputBar.displayName = "ChatInputBar";
