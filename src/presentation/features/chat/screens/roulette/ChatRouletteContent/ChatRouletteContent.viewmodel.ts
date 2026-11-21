/** @format */

import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";
import { useChatStore } from "@/src/presentation/stores";

import { useChatNavigation } from "../../../shared/hooks";
import type { ChatConversationEntity } from "../../../shared/types";

import { ROULETTE_TOPICS } from "./ChatRouletteContent.constants";
import type { ChatRouletteViewModel } from "./ChatRouletteContent.types";

export function useChatRouletteViewModel(): ChatRouletteViewModel {
  const { getMatchRouletteUseCase } = useUseCases();
  const { navigateBack, navigateToChat } = useChatNavigation();
  const upsertConversation = useChatStore((s) => s.upsertConversation);

  const [selectedTopic, setSelectedTopic] = useState<string>(
    ROULETTE_TOPICS[0]?.value ?? "React Native"
  );
  const [isScanning, setIsScanning] = useState(false);
  const [matchedRoom, setMatchedRoom] = useState<ChatConversationEntity | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const startMatching = useCallback(() => {
    clearTimer();
    setMatchedRoom(null);
    setIsScanning(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    scanTimerRef.current = setTimeout(() => {
      void getMatchRouletteUseCase.execute(selectedTopic).then((result) => {
        setIsScanning(false);
        if (isErr(result)) {
          log.error("Failed to match roulette:", result.error);
          return;
        }
        upsertConversation(result.value);
        setMatchedRoom(result.value);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      });
    }, 1100);
  }, [clearTimer, getMatchRouletteUseCase, selectedTopic, upsertConversation]);

  const cancelMatching = useCallback(() => {
    clearTimer();
    setIsScanning(false);
  }, [clearTimer]);

  const enterMatchedRoom = useCallback(() => {
    if (!matchedRoom) return;
    navigateToChat(matchedRoom.id);
  }, [matchedRoom, navigateToChat]);

  return {
    selectedTopic,
    isScanning,
    matchedRoom,
    setSelectedTopic,
    startMatching,
    cancelMatching,
    enterMatchedRoom,
    navigateBack,
  };
}
