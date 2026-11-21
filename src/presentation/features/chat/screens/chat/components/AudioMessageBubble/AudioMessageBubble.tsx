/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useMemo } from "react";
import { View } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";
import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useHaptics, useUI } from "@/src/presentation/hooks";
import { CSS_EASE_OUT, MOTION_DURATION } from "@/src/presentation/theme";

import {
  AUDIO_MESSAGE_BUBBLE_TEST_IDS,
  DEFAULT_WAVEFORM_BARS,
} from "./AudioMessageBubble.constants";
import { styles } from "./AudioMessageBubble.styles";
import type { AudioMessageBubbleProps } from "./AudioMessageBubble.types";
import { formatAudioTime, useAudioPlayback } from "./useAudioPlayback";

const WAVEFORM_TRANSITION_PROPERTIES: ("backgroundColor" | "opacity" | "transform")[] = [
  "backgroundColor",
  "opacity",
  "transform",
];

export const AudioMessageBubble = memo<AudioMessageBubbleProps>(
  ({
    audioUrl,
    durationSeconds = 0,
    waveformBars,
    isOwn = false,
    testID = AUDIO_MESSAGE_BUBBLE_TEST_IDS.ROOT,
  }) => {
    const { colors, t } = useUI();
    const haptics = useHaptics();
    const reducedMotion = useReducedMotion();

    const {
      isPlaying,
      currentTime,
      totalDuration,
      playbackSpeed,
      togglePlayPause,
      cyclePlaybackSpeed,
      seekToRatio,
    } = useAudioPlayback(audioUrl, durationSeconds);

    const handleHaptics = useCallback(
      (type: HapticFeedbackType) => haptics.trigger(type),
      [haptics]
    );

    const bars = useMemo(() => {
      if (waveformBars && waveformBars.length > 0) {
        return waveformBars;
      }
      return DEFAULT_WAVEFORM_BARS;
    }, [waveformBars]);

    const progressRatio = totalDuration > 0 ? Math.min(currentTime / totalDuration, 1) : 0;
    const activeBarColor = isOwn ? colors.textOnPrimary : colors.accent;
    const inactiveBarColor = isOwn ? colors.textOnPrimary : colors.borderStrong;
    const playBtnBg = isOwn ? colors.white : colors.primary;
    const playIconColor = isOwn ? colors.primary : colors.textOnPrimary;

    return (
      <View testID={testID} accessibilityLabel={t("chat.audioMessage")} style={styles.container}>
        <View style={styles.controlsRow}>
          <AnimatedPressable
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.PLAY_PAUSE_BUTTON}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? t("chat.pauseAudio") : t("chat.playAudio")}
            scaleTo={0.95}
            hapticType={HapticFeedbackType.Light}
            onHaptic={handleHaptics}
            onPress={togglePlayPause}
            style={[styles.playButton, { backgroundColor: playBtnBg }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={17} color={playIconColor} />
          </AnimatedPressable>

          <View
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.WAVEFORM_CONTAINER}
            style={styles.waveformContainer}
          >
            {bars.map((bar, index) => {
              const barRatio = index / bars.length;
              const isPlayed = barRatio <= progressRatio;
              const isCurrentBar =
                isPlaying &&
                index === Math.min(bars.length - 1, Math.floor(progressRatio * bars.length));
              const barHeight = Math.max(6, Math.min(Math.round(bar * 30), 30));

              return (
                <AnimatedPressable
                  key={index}
                  testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.WAVEFORM_BAR(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t("chat.audioMessage")} ${formatAudioTime((index / bars.length) * totalDuration)}`}
                  onPress={() => seekToRatio(index / bars.length)}
                  hapticType={HapticFeedbackType.Light}
                  onHaptic={handleHaptics}
                  hitSlop={{ top: 8, bottom: 8, left: 1, right: 1 }}
                  style={styles.waveformBarButton}
                >
                  <Animated.View
                    style={[
                      styles.waveformBar,
                      {
                        height: barHeight,
                        backgroundColor: isPlayed ? activeBarColor : inactiveBarColor,
                        opacity: isOwn && !isPlayed ? 0.35 : 1,
                        transform: [{ scaleY: isCurrentBar && !reducedMotion ? 1.16 : 1 }],
                        transitionProperty: WAVEFORM_TRANSITION_PROPERTIES,
                        transitionDuration: MOTION_DURATION.micro,
                        transitionTimingFunction: CSS_EASE_OUT,
                      },
                    ]}
                  />
                </AnimatedPressable>
              );
            })}
          </View>

          <AnimatedPressable
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.SPEED_BUTTON}
            accessibilityRole="button"
            accessibilityLabel={`${t("chat.playbackSpeed")} ${playbackSpeed}x`}
            scaleTo={0.95}
            hapticType={HapticFeedbackType.Light}
            onHaptic={handleHaptics}
            onPress={cyclePlaybackSpeed}
            style={[
              styles.speedButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderStrong,
              },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Text style={[styles.speedText, { color: colors.textPrimary }]}>{playbackSpeed}x</Text>
          </AnimatedPressable>
        </View>

        <View style={styles.timeRow}>
          <Text
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.CURRENT_TIME}
            variant="xs"
            color={isOwn ? colors.textOnPrimary : colors.textSecondary}
            style={styles.timeText}
          >
            {formatAudioTime(currentTime)}
          </Text>
          <Text
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.TOTAL_DURATION}
            variant="xs"
            color={isOwn ? colors.textOnPrimary : colors.textSecondary}
            style={styles.timeText}
          >
            {formatAudioTime(totalDuration)}
          </Text>
        </View>
      </View>
    );
  }
);

AudioMessageBubble.displayName = "AudioMessageBubble";
