/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import {
  AUDIO_MESSAGE_BUBBLE_TEST_IDS,
  DEFAULT_WAVEFORM_BARS,
} from "./AudioMessageBubble.constants";
import { styles } from "./AudioMessageBubble.styles";
import type { AudioMessageBubbleProps } from "./AudioMessageBubble.types";

export const AudioMessageBubble = memo<AudioMessageBubbleProps>(
  ({
    audioUrl: _audioUrl,
    durationSeconds = 0,
    waveformBars,
    isOwn = false,
    testID = AUDIO_MESSAGE_BUBBLE_TEST_IDS.ROOT,
  }) => {
    const { colors, t } = useUI();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(durationSeconds > 0 ? durationSeconds : 5);
    const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      if (durationSeconds > 0) {
        setTotalDuration(durationSeconds);
      }
    }, [durationSeconds]);

    useEffect(() => {
      if (isPlaying) {
        timerRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 0.1 * playbackSpeed;
            if (next >= totalDuration) {
              setIsPlaying(false);
              return 0;
            }
            return next;
          });
        }, 100);
      } else if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [isPlaying, playbackSpeed, totalDuration]);

    const togglePlayPause = useCallback(() => {
      setIsPlaying((prev) => !prev);
    }, []);

    const cyclePlaybackSpeed = useCallback(() => {
      setPlaybackSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
    }, []);

    const seekToRatio = useCallback(
      (ratio: number) => {
        const clamped = Math.max(0, Math.min(ratio, 1));
        setCurrentTime(clamped * totalDuration);
      },
      [totalDuration]
    );

    const bars = useMemo(() => {
      if (waveformBars && waveformBars.length > 0) {
        return waveformBars;
      }
      return DEFAULT_WAVEFORM_BARS;
    }, [waveformBars]);

    const progressRatio = totalDuration > 0 ? Math.min(currentTime / totalDuration, 1) : 0;

    const formatTime = (sec: number) => {
      const rounded = Math.round(sec * 10) / 10;
      const s = Math.floor(rounded || 0);
      const m = Math.floor(s / 60);
      const rem = s % 60;
      return `${m}:${rem.toString().padStart(2, "0")}`;
    };

    const activeBarColor = isOwn ? colors.textOnPrimary : colors.accent;
    const inactiveBarColor = isOwn ? colors.primaryTint : colors.borderStrong;
    const playBtnBg = isOwn ? colors.accent : colors.primary;

    return (
      <View testID={testID} accessibilityLabel={t("chat.audioMessage")} style={styles.container}>
        <View style={styles.controlsRow}>
          <Pressable
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.PLAY_PAUSE_BUTTON}
            accessibilityLabel={isPlaying ? t("chat.pauseAudio") : t("chat.playAudio")}
            onPress={togglePlayPause}
            style={({ pressed }) => [
              styles.playButton,
              { backgroundColor: playBtnBg },
              pressed && { opacity: 0.75 },
            ]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={16} color={colors.textOnPrimary} />
          </Pressable>

          <View
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.WAVEFORM_CONTAINER}
            style={styles.waveformContainer}
          >
            {bars.map((bar, index) => {
              const barRatio = index / bars.length;
              const isPlayed = barRatio <= progressRatio;
              const barHeight = Math.max(6, Math.min(Math.round(bar * 28), 28));

              return (
                <Pressable
                  key={index}
                  testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.WAVEFORM_BAR(index)}
                  onPress={() => seekToRatio(index / bars.length)}
                  hitSlop={{ top: 8, bottom: 8, left: 1, right: 1 }}
                  style={({ pressed }) => [
                    styles.waveformBar,
                    {
                      height: barHeight,
                      backgroundColor: isPlayed ? activeBarColor : inactiveBarColor,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                />
              );
            })}
          </View>

          <Pressable
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.SPEED_BUTTON}
            accessibilityLabel={t("chat.playbackSpeed")}
            onPress={cyclePlaybackSpeed}
            style={({ pressed }) => [
              styles.speedButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderStrong,
              },
              pressed && { opacity: 0.7 },
            ]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[styles.speedText, { color: colors.textPrimary }]}>{playbackSpeed}x</Text>
          </Pressable>
        </View>

        <View style={styles.timeRow}>
          <Text
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.CURRENT_TIME}
            variant="xs"
            color={isOwn ? colors.textOnPrimary : colors.textSecondary}
            style={styles.timeText}
          >
            {formatTime(currentTime)}
          </Text>
          <Text
            testID={AUDIO_MESSAGE_BUBBLE_TEST_IDS.TOTAL_DURATION}
            variant="xs"
            color={isOwn ? colors.textOnPrimary : colors.textSecondary}
            style={styles.timeText}
          >
            {formatTime(totalDuration)}
          </Text>
        </View>
      </View>
    );
  }
);

AudioMessageBubble.displayName = "AudioMessageBubble";
