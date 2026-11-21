/** @format */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";
import { useChatStore } from "@/src/presentation/stores";

import type { ChatConversationEntity } from "../../../../shared/types";

import { bindChatSocketEvents } from "./useChatSocketHandlers";

export function useChatData(conversationId: string | null) {
  const { getGetMessagesUseCase, getGetConversationByIdUseCase, getChatSocketService } =
    useUseCases();
  const [conversation, setConversation] = useState<ChatConversationEntity | null>(null);

  const {
    messages,
    nextCursors,
    typingUsers,
    isLoadingMessages,
    error,
    supportPresence,
    queueStatuses,
    outboundQueueCount,
    setCurrentConversationId,
    setMessages,
    appendMessages,
    upsertMessage,
    updateMessageStatus,
    setTypingUsers,
    markMessagesRead,
    removeAttachment,
    setIsLoadingMessages,
    setError,
    setSupportPresence,
    setQueueStatus,
    setOutboundQueueCount,
  } = useChatStore(
    useShallow((state) => ({
      messages: state.messages,
      nextCursors: state.nextCursors,
      typingUsers: state.typingUsers,
      isLoadingMessages: state.isLoadingMessages,
      error: state.error,
      supportPresence: state.supportPresence,
      queueStatuses: state.queueStatuses,
      outboundQueueCount: state.outboundQueueCount,
      setCurrentConversationId: state.setCurrentConversationId,
      setMessages: state.setMessages,
      appendMessages: state.appendMessages,
      upsertMessage: state.upsertMessage,
      updateMessageStatus: state.updateMessageStatus,
      setTypingUsers: state.setTypingUsers,
      markMessagesRead: state.markMessagesRead,
      removeAttachment: state.removeAttachment,
      setIsLoadingMessages: state.setIsLoadingMessages,
      setError: state.setError,
      setSupportPresence: state.setSupportPresence,
      setQueueStatus: state.setQueueStatus,
      setOutboundQueueCount: state.setOutboundQueueCount,
    }))
  );

  const invertedMessages = useMemo(() => {
    if (!conversationId) return [];
    const list = messages[conversationId] ?? [];
    return [...list].sort(
      (a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0)
    );
  }, [messages, conversationId]);

  const myNextCursor = conversationId ? (nextCursors[conversationId] ?? null) : null;
  const myTypingUsers = conversationId ? (typingUsers[conversationId] ?? []) : [];

  const fetchData = useCallback(async () => {
    if (!conversationId) return;
    setIsLoadingMessages(true);
    setError(null);

    const [convResult, msgResult] = await Promise.all([
      getGetConversationByIdUseCase.execute(conversationId),
      getGetMessagesUseCase.execute(conversationId),
    ]);

    if (isErr(convResult)) {
      log.error("Failed to fetch conversation:", convResult.error);
    } else if (convResult.value) {
      setConversation(convResult.value);
    }

    if (isErr(msgResult)) {
      log.error("Failed to fetch messages:", msgResult.error);
      setError(msgResult.error.message);
    } else {
      setMessages(conversationId, msgResult.value.data, msgResult.value.nextCursor);
      const lastAgentMsg = [...msgResult.value.data].reverse().find((m) => m.senderType !== "USER");
      if (lastAgentMsg?.id) {
        getChatSocketService.markMessageRead(conversationId, lastAgentMsg.id);
      }
    }

    setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
    setIsLoadingMessages(false);
  }, [
    conversationId,
    getChatSocketService,
    getGetConversationByIdUseCase,
    getGetMessagesUseCase,
    setError,
    setIsLoadingMessages,
    setMessages,
    setOutboundQueueCount,
  ]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setCurrentConversationId(conversationId);
      await fetchData();
    });

    if (!conversationId) {
      return () => {
        active = false;
        setCurrentConversationId(null);
      };
    }

    if (!getChatSocketService.isConnected()) {
      void getChatSocketService.connect();
    }
    getChatSocketService.joinConversation(conversationId);

    const unbind = bindChatSocketEvents(
      conversationId,
      getChatSocketService,
      {
        upsertMessage,
        updateMessageStatus,
        setTypingUsers,
        markMessagesRead,
        removeAttachment,
        setQueueStatus,
        setOutboundQueueCount,
        setSupportPresence,
      },
      () => {
        void fetchData();
      }
    );

    return () => {
      active = false;
      setCurrentConversationId(null);
      getChatSocketService.leaveConversation(conversationId);
      unbind();
    };
  }, [
    conversationId,
    fetchData,
    setCurrentConversationId,
    getChatSocketService,
    upsertMessage,
    updateMessageStatus,
    setTypingUsers,
    markMessagesRead,
    removeAttachment,
    setQueueStatus,
    setOutboundQueueCount,
    setSupportPresence,
  ]);

  const loadMore = useCallback(() => {
    if (conversationId && myNextCursor && !isLoadingMessages) {
      setIsLoadingMessages(true);
      void getGetMessagesUseCase.execute(conversationId, myNextCursor).then((result) => {
        if (!isErr(result)) {
          appendMessages(conversationId, result.value.data, result.value.nextCursor);
        }
        setIsLoadingMessages(false);
      });
    }
  }, [
    myNextCursor,
    isLoadingMessages,
    conversationId,
    getGetMessagesUseCase,
    appendMessages,
    setIsLoadingMessages,
  ]);

  return {
    conversation,
    invertedMessages,
    isLoadingMessages,
    error,
    myTypingUsers,
    supportPresence,
    queueStatuses,
    outboundQueueCount,
    fetchData,
    loadMore,
  };
}
