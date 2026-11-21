/** @format */

import { useCallback, useEffect, useRef, useState } from "react";

import { useUseCases } from "@/src/di/UseCasesProvider";

import { CHAT_CONSTANTS } from "../../../../shared/constants";

export function useChatInput(conversationId: string | null) {
  const { getChatSocketService } = useUseCases();
  const [draft, setDraft] = useState<{
    readonly convId: string | null;
    readonly text: string;
  }>({ convId: conversationId, text: "" });
  const inputText = draft.convId === conversationId ? draft.text : "";

  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTypingNow = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current && conversationId) {
      isTypingRef.current = false;
      getChatSocketService.stopTyping(conversationId);
    }
  }, [conversationId, getChatSocketService]);

  const handleTextChange = useCallback(
    (text: string) => {
      setDraft({ convId: conversationId, text });

      if (text.trim().length > 0) {
        if (!isTypingRef.current && conversationId) {
          isTypingRef.current = true;
          getChatSocketService.startTyping(conversationId);
        }

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          typingTimeoutRef.current = null;
          if (isTypingRef.current && conversationId) {
            isTypingRef.current = false;
            getChatSocketService.stopTyping(conversationId);
          }
        }, CHAT_CONSTANTS.TYPING_DEBOUNCE_MS);
      } else {
        stopTypingNow();
      }
    },
    [conversationId, getChatSocketService, stopTypingNow]
  );

  const clearInput = useCallback(() => {
    setDraft({ convId: conversationId, text: "" });
    stopTypingNow();
  }, [conversationId, stopTypingNow]);

  useEffect(() => {
    return () => {
      stopTypingNow();
    };
  }, [conversationId, stopTypingNow]);

  return {
    inputText,
    setInputText: handleTextChange,
    isTypingRef,
    stopTypingNow,
    clearInput,
  };
}
