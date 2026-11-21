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

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    setDurationMs(0);

    const result = await startVoiceRecordingUseCase.execute();
    if (isErr(result)) {
      setError(result.error.message);
      return false;
    }

    setIsRecording(true);
    const startTimestamp = Date.now();
    clearTimer();
    timerRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimestamp);
    }, 200);

    return true;
  }, [clearTimer, startVoiceRecordingUseCase]);

  const stopRecording = useCallback(async (): Promise<VoiceNote | null> => {
    clearTimer();
    setIsRecording(false);

    const result = await stopVoiceRecordingUseCase.execute();
    if (isErr(result)) {
      setError(result.error.message);
      return null;
    }

    setDurationMs(0);
    return isOk(result) ? result.value : null;
  }, [clearTimer, stopVoiceRecordingUseCase]);

  const cancelRecording = useCallback(async (): Promise<void> => {
    clearTimer();
    setIsRecording(false);
    setDurationMs(0);

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
