/** @format */

import { useCallback, useEffect, useRef, useState } from "react";

import { useUseCases } from "@/src/di/UseCasesProvider";
import type { VoiceNote } from "@/src/domain/entities/VoiceNote";
import { isErr, isOk } from "@/src/domain/Result";

export interface UseVoiceRecordingResult {
  readonly isRecording: boolean;
  readonly durationMs: number;
  readonly formattedTime: string;
  readonly error: string | null;
  readonly startRecording: () => Promise<boolean>;
  readonly stopRecording: () => Promise<VoiceNote | null>;
  readonly cancelRecording: () => Promise<void>;
}

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const useVoiceRecording = (): UseVoiceRecordingResult => {
  const { startVoiceRecordingUseCase, stopVoiceRecordingUseCase, cancelVoiceRecordingUseCase } =
    useUseCases();

  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);
  const inFlightRef = useRef(false);
  const isMountedRef = useRef(true);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimer();
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
        void cancelVoiceRecordingUseCase.execute();
      }
    };
  }, [cancelVoiceRecordingUseCase, clearTimer]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (inFlightRef.current || isRecordingRef.current) return false;
    inFlightRef.current = true;
    try {
      setError(null);
      setDurationMs(0);

      const result = await startVoiceRecordingUseCase.execute();
      if (!isMountedRef.current) {
        if (isOk(result)) {
          void cancelVoiceRecordingUseCase.execute();
        }
        return false;
      }
      if (isErr(result)) {
        setError(result.error.message);
        return false;
      }

      isRecordingRef.current = true;
      setIsRecording(true);
      const startTimestamp = Date.now();
      clearTimer();
      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimestamp);
      }, 200);

      return true;
    } finally {
      inFlightRef.current = false;
    }
  }, [cancelVoiceRecordingUseCase, clearTimer, startVoiceRecordingUseCase]);

  const stopRecording = useCallback(async (): Promise<VoiceNote | null> => {
    if (inFlightRef.current || !isRecordingRef.current) return null;
    inFlightRef.current = true;
    clearTimer();
    isRecordingRef.current = false;
    setIsRecording(false);

    try {
      const result = await stopVoiceRecordingUseCase.execute();
      if (!isMountedRef.current) return null;
      if (isErr(result)) {
        setError(result.error.message);
        return null;
      }

      setDurationMs(0);
      return isOk(result) ? result.value : null;
    } finally {
      inFlightRef.current = false;
    }
  }, [clearTimer, stopVoiceRecordingUseCase]);

  const cancelRecording = useCallback(async (): Promise<void> => {
    clearTimer();
    isRecordingRef.current = false;
    if (isMountedRef.current) {
      setIsRecording(false);
      setDurationMs(0);
    }

    await cancelVoiceRecordingUseCase.execute();
  }, [clearTimer, cancelVoiceRecordingUseCase]);

  return {
    isRecording,
    durationMs,
    formattedTime: formatDuration(durationMs),
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
