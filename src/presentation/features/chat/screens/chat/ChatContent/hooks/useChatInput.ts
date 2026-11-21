/** @format */

import { useCallback, useRef, useState } from "react";

import { useUseCases } from "@/src/di/UseCasesProvider";

import { CHAT_CONSTANTS } from "../../../../shared/constants";

export function useChatInput(conversationId: string | null) {
  const { getChatSocketService } = useUseCases();
  const [inputText, setInputText] = useState("");
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = useCallback(
    (text: string) => {
      setInputText(text);

      if (text.length > 0) {
        if (!isTypingRef.current && conversationId) {
          isTypingRef.current = true;
          getChatSocketService.startTyping(conversationId);
        }

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          if (isTypingRef.current && conversationId) {
            isTypingRef.current = false;
            getChatSocketService.stopTyping(conversationId);
          }
        }, CHAT_CONSTANTS.TYPING_DEBOUNCE_MS);
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (isTypingRef.current && conversationId) {
          isTypingRef.current = false;
          getChatSocketService.stopTyping(conversationId);
        }
      }
    },
    [conversationId, getChatSocketService]
  );

  const clearInput = useCallback(() => {
    setInputText("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  return {
    inputText,
    setInputText: handleTextChange,
    isTypingRef,
    clearInput,
  };
}
