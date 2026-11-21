/** @format */

import { useAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

import { resolveSafeMediaUrl } from "../../../../shared/utils/urlValidator";

let stopActiveBubble: (() => void) | null = null;

export function formatAudioTime(sec: number): string {
  const rounded = Math.round(sec * 10) / 10;
  const s = Math.floor(rounded || 0);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export function useAudioPlayback(audioUrl: string, durationSeconds: number) {
  const safeAudioUrl = resolveSafeMediaUrl(audioUrl, { allowLocal: true });
  const isSimulated = !safeAudioUrl || safeAudioUrl.startsWith("simulated://");

  const [hasLoadedNative, setHasLoadedNative] = useState(false);
  const player = useAudioPlayer(hasLoadedNative && !isSimulated ? safeAudioUrl : null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = durationSeconds > 0 ? durationSeconds : 5;
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);
  const currentTimeRef = useRef(0);
  const pendingNativePlayRef = useRef(false);
  const finishedRef = useRef(false);

  const pauseSelf = useCallback(() => {
    pendingNativePlayRef.current = false;
    setIsPlaying(false);
    if (!isSimulated && hasLoadedNative) {
      try {
        player.pause();
      } catch {}
    }
  }, [hasLoadedNative, isSimulated, player]);

  const pausePlaybackRef = useRef(pauseSelf);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    pausePlaybackRef.current = pauseSelf;
  }, [pauseSelf]);

  const stopSelf = useCallback(() => {
    pausePlaybackRef.current();
  }, []);

  useEffect(() => {
    if (hasLoadedNative && !isSimulated && pendingNativePlayRef.current) {
      pendingNativePlayRef.current = false;
      try {
        player.setPlaybackRate(playbackSpeed);
        player.play();
      } catch {}
    }
  }, [hasLoadedNative, isSimulated, playbackSpeed, player]);

  useEffect(() => {
    return () => {
      if (stopActiveBubble === stopSelf) {
        stopActiveBubble = null;
      }
      if (!isSimulated && hasLoadedNative && isPlayingRef.current) {
        try {
          player.pause();
        } catch {}
      }
    };
  }, [hasLoadedNative, isSimulated, player, stopSelf]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return undefined;
    }

    let elapsed = currentTimeRef.current;
    timerRef.current = setInterval(() => {
      elapsed += 0.1 * playbackSpeed;
      if (elapsed >= totalDuration) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (stopActiveBubble === stopSelf) {
          stopActiveBubble = null;
        }
        finishedRef.current = true;
        currentTimeRef.current = 0;
        setIsPlaying(false);
        setCurrentTime(0);
        if (!isSimulated && hasLoadedNative) {
          try {
            player.pause();
          } catch {}
          void player.seekTo(0).catch(() => {});
        }
        return;
      }
      currentTimeRef.current = elapsed;
      setCurrentTime(elapsed);
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasLoadedNative, isPlaying, isSimulated, playbackSpeed, player, stopSelf, totalDuration]);

  const togglePlayPause = useCallback(() => {
    const next = !isPlaying;
    if (next) {
      if (stopActiveBubble && stopActiveBubble !== stopSelf) {
        stopActiveBubble();
      }
      stopActiveBubble = stopSelf;
      if (!isSimulated) {
        if (!hasLoadedNative) {
          pendingNativePlayRef.current = true;
          setHasLoadedNative(true);
        } else {
          if (finishedRef.current) {
            finishedRef.current = false;
            void player.seekTo(0).catch(() => {});
          }
          try {
            player.setPlaybackRate(playbackSpeed);
            player.play();
          } catch {}
        }
      } else {
        finishedRef.current = false;
      }
    } else {
      if (stopActiveBubble === stopSelf) {
        stopActiveBubble = null;
      }
      pendingNativePlayRef.current = false;
      if (!isSimulated && hasLoadedNative) {
        try {
          player.pause();
        } catch {}
      }
    }
    setIsPlaying(next);
  }, [hasLoadedNative, isPlaying, isSimulated, playbackSpeed, player, stopSelf]);

  const cyclePlaybackSpeed = useCallback(() => {
    const nextSpeed: 1 | 1.5 | 2 = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (!isSimulated && hasLoadedNative) {
      try {
        player.setPlaybackRate(nextSpeed);
      } catch {}
    }
  }, [hasLoadedNative, isSimulated, playbackSpeed, player]);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const clamped = Math.max(0, Math.min(ratio, 1));
      const nextTime = clamped * totalDuration;
      finishedRef.current = false;
      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);
      if (!isSimulated) {
        if (!hasLoadedNative) {
          setHasLoadedNative(true);
        } else {
          void player.seekTo(nextTime).catch(() => {});
        }
      }
    },
    [hasLoadedNative, isSimulated, player, totalDuration]
  );

  return {
    isPlaying,
    currentTime,
    totalDuration,
    playbackSpeed,
    togglePlayPause,
    cyclePlaybackSpeed,
    seekToRatio,
  };
}
