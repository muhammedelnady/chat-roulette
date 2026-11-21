/** @format */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import type { UseUIReturn } from "@/src/presentation/hooks/useUI";

import { CHAT_INPUT_BAR_TEST_IDS } from "./ChatInputBar.constants";
import { styles } from "./ChatInputBar.styles";

export interface AudioRecordingTrayProps {
  readonly formattedRecordingTime: string;
  readonly onCancelRecording: () => void;
  readonly onSendRecording: () => void;
  readonly colors: UseUIReturn["colors"];
  readonly isRTL: boolean;
  readonly t: UseUIReturn["t"];
}

export const AudioRecordingTray = React.memo(function AudioRecordingTray({
  formattedRecordingTime,
  onCancelRecording,
  onSendRecording,
  colors,
  isRTL,
  t,
}: AudioRecordingTrayProps) {
  return (
    <>
      <View
        testID={CHAT_INPUT_BAR_TEST_IDS.RECORDING_TRAY}
        style={[
          styles.recordingTray,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.borderStrong,
          },
        ]}
      >
        <View style={[styles.recordingDot, { backgroundColor: colors.error }]} />
        <Text variant="sm" weight="medium" color={colors.error} style={styles.recordingLabel}>
          {t("chat.recording")}
        </Text>
        <Text
          testID={CHAT_INPUT_BAR_TEST_IDS.RECORDING_TIMER}
          variant="sm"
          weight="bold"
          color={colors.textPrimary}
          style={styles.recordingTimer}
        >
          {formattedRecordingTime}
        </Text>
      </View>

      <Pressable
        testID={CHAT_INPUT_BAR_TEST_IDS.CANCEL_RECORDING}
        accessibilityLabel={t("chat.cancelRecording")}
        onPress={onCancelRecording}
        style={({ pressed }) => [
          styles.cancelButton,
          {
            backgroundColor: colors.surfaceElevated,
            [isRTL ? "marginRight" : "marginLeft"]: 6,
          },
          pressed && { opacity: 0.7 },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
      </Pressable>

      <Pressable
        testID={CHAT_INPUT_BAR_TEST_IDS.SEND_RECORDING}
        accessibilityLabel={t("chat.sendRecording")}
        onPress={onSendRecording}
        style={({ pressed }) => [
          styles.sendButton,
          {
            backgroundColor: colors.primary,
            [isRTL ? "marginRight" : "marginLeft"]: 6,
          },
          pressed && { opacity: 0.7 },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={isRTL ? "arrow-back" : "arrow-up"} size={20} color={colors.textOnPrimary} />
      </Pressable>
    </>
  );
});

AudioRecordingTray.displayName = "AudioRecordingTray";
