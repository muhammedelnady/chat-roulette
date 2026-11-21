/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { AnimatedPressable, PulseDot, Text } from "@/src/presentation/components/atoms";
import type { UseUIReturn } from "@/src/presentation/hooks/useUI";
import { EASE_IN_OUT, FADE_ENTER, FADE_EXIT, gradients } from "@/src/presentation/theme";

import { CHAT_INPUT_BAR_TEST_IDS } from "./ChatInputBar.constants";
import { styles } from "./ChatInputBar.styles";

export interface AudioRecordingTrayProps {
  readonly formattedRecordingTime: string;
  readonly onCancelRecording: () => void;
  readonly onSendRecording: () => void;
  readonly colors: UseUIReturn["colors"];
  readonly shadows: UseUIReturn["shadows"];
  readonly t: UseUIReturn["t"];
}

const METER_PHASE_OFFSETS = [0.08, 0.34, 0.62, 0.44, 0.18] as const;

interface RecordingMeterBarProps {
  readonly phaseOffset: number;
  readonly wave: SharedValue<number>;
  readonly color: string;
  readonly reducedMotion: boolean;
}

const RecordingMeterBar = React.memo<RecordingMeterBarProps>(
  ({ phaseOffset, wave, color, reducedMotion }) => {
    const barStyle = useAnimatedStyle(() => {
      if (reducedMotion) {
        return {
          transform: [{ scaleY: 0.45 + phaseOffset * 0.4 }],
          opacity: 0.75,
        };
      }
      const cycle = Math.abs(Math.sin((wave.get() + phaseOffset) * Math.PI));
      return {
        transform: [{ scaleY: 0.35 + cycle * 0.65 }],
        opacity: 0.55 + cycle * 0.45,
      };
    });

    return (
      <Animated.View style={[styles.recordingMeterBar, { backgroundColor: color }, barStyle]} />
    );
  }
);

RecordingMeterBar.displayName = "RecordingMeterBar";

export const AudioRecordingTray = React.memo(function AudioRecordingTray({
  formattedRecordingTime,
  onCancelRecording,
  onSendRecording,
  colors,
  shadows,
  t,
}: AudioRecordingTrayProps) {
  const reducedMotion = useReducedMotion();
  const wave = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(wave);
    if (!reducedMotion) {
      wave.set(0);
      wave.set(withRepeat(withTiming(1, { duration: 720, easing: EASE_IN_OUT }), -1, true));
    } else {
      wave.set(0);
    }

    return () => {
      cancelAnimation(wave);
    };
  }, [reducedMotion, wave]);

  return (
    <>
      <Animated.View
        testID={CHAT_INPUT_BAR_TEST_IDS.RECORDING_TRAY}
        entering={FADE_ENTER}
        exiting={FADE_EXIT}
        style={[
          styles.recordingTray,
          {
            backgroundColor: colors.errorTint,
            borderColor: colors.errorBorder,
          },
        ]}
      >
        <PulseDot
          color={colors.error}
          haloColor={colors.errorBorder}
          size={9}
          haloSize={16}
          active
        />
        <Text variant="sm" weight="bold" color={colors.error} style={styles.recordingLabel}>
          {t("chat.recording")}
        </Text>
        <View style={styles.recordingMeter}>
          {METER_PHASE_OFFSETS.map((phaseOffset, idx) => (
            <RecordingMeterBar
              key={idx}
              phaseOffset={phaseOffset}
              wave={wave}
              color={colors.error}
              reducedMotion={reducedMotion}
            />
          ))}
        </View>
        <Text
          testID={CHAT_INPUT_BAR_TEST_IDS.RECORDING_TIMER}
          variant="sm"
          weight="bold"
          color={colors.textPrimary}
          style={styles.recordingTimer}
        >
          {formattedRecordingTime}
        </Text>
      </Animated.View>

      <AnimatedPressable
        testID={CHAT_INPUT_BAR_TEST_IDS.CANCEL_RECORDING}
        accessibilityLabel={t("chat.cancelRecording")}
        scaleTo={0.95}
        onPress={onCancelRecording}
        style={[
          styles.cancelButton,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
      </AnimatedPressable>

      <AnimatedPressable
        testID={CHAT_INPUT_BAR_TEST_IDS.SEND_RECORDING}
        accessibilityLabel={t("chat.sendRecording")}
        scaleTo={0.95}
        onPress={onSendRecording}
        style={[styles.sendButton, shadows.glowPrimary]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientActionFill}
        >
          <Ionicons name="arrow-up" size={20} color={colors.textOnPrimary} />
        </LinearGradient>
      </AnimatedPressable>
    </>
  );
});

AudioRecordingTray.displayName = "AudioRecordingTray";
