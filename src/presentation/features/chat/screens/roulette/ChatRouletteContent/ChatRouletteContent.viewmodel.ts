/** @format */

import { useCallback, useEffect, useRef, useState } from "react";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";
import { useHaptics, useUI } from "@/src/presentation/hooks";
import { useChatStore } from "@/src/presentation/stores";

import { useChatNavigation } from "../../../shared/hooks";
import type { ChatConversationEntity } from "../../../shared/types";

import { MATCH_SCAN_DELAY_MS, ROULETTE_TOPICS } from "./ChatRouletteContent.constants";
import type { ChatRouletteViewModel } from "./ChatRouletteContent.types";

export function useChatRouletteViewModel(): ChatRouletteViewModel {
  const { getMatchRouletteUseCase } = useUseCases();
  const haptics = useHaptics();
  const { t } = useUI();
  const { navigateBack, replaceWithChat } = useChatNavigation();
  const upsertConversation = useChatStore((s) => s.upsertConversation);

  const [selectedTopic, setSelectedTopic] = useState<string>(
    ROULETTE_TOPICS[0]?.value ?? "React Native"
  );
  const [isScanning, setIsScanning] = useState(false);
  const [matchedRoom, setMatchedRoom] = useState<ChatConversationEntity | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const isScanningRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      isScanningRef.current = false;
      matchRequestIdRef.current += 1;
      clearTimer();
    };
  }, [clearTimer]);

  const handleSelectTopic = useCallback((topic: string) => {
    if (isScanningRef.current) return;
    setSelectedTopic(topic);
    setMatchedRoom(null);
    setError(null);
  }, []);

  const startMatching = useCallback(() => {
    clearTimer();
    const requestId = ++matchRequestIdRef.current;
    isScanningRef.current = true;
    setMatchedRoom(null);
    setError(null);
    setIsScanning(true);
    void haptics.medium();

    scanTimerRef.current = setTimeout(() => {
      scanTimerRef.current = null;
      void getMatchRouletteUseCase
        .execute(selectedTopic)
        .then((result) => {
          if (
            !isMountedRef.current ||
            requestId !== matchRequestIdRef.current ||
            !isScanningRef.current
          ) {
            return;
          }
          isScanningRef.current = false;
          setIsScanning(false);
          if (isErr(result)) {
            log.error("Failed to match roulette:", result.error);
            setError(t("roulette.matchFailed"));
            void haptics.error();
            return;
          }
          upsertConversation(result.value);
          setMatchedRoom(result.value);
          void haptics.success();
        })
        .catch((err: unknown) => {
          if (
            !isMountedRef.current ||
            requestId !== matchRequestIdRef.current ||
            !isScanningRef.current
          ) {
            return;
          }
          isScanningRef.current = false;
          setIsScanning(false);
          log.error("Unexpected roulette match failure:", err);
          setError(t("roulette.matchFailed"));
          void haptics.error();
        });
    }, MATCH_SCAN_DELAY_MS);
  }, [clearTimer, getMatchRouletteUseCase, haptics, selectedTopic, t, upsertConversation]);

  const cancelMatching = useCallback(() => {
    clearTimer();
    matchRequestIdRef.current += 1;
    isScanningRef.current = false;
    setIsScanning(false);
  }, [clearTimer]);

  const enterMatchedRoom = useCallback(() => {
    if (!matchedRoom) return;
    const roomId = matchedRoom.id;
    setMatchedRoom(null);
    replaceWithChat(roomId);
  }, [matchedRoom, replaceWithChat]);

  return {
    selectedTopic,
    isScanning,
    matchedRoom,
    error,
    setSelectedTopic: handleSelectTopic,
    startMatching,
    cancelMatching,
    enterMatchedRoom,
    navigateBack,
  };
}
