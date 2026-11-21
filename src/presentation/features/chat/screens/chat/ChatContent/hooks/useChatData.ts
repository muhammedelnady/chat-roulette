/** @format */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";
import { useChatStore } from "@/src/presentation/stores";

import type { ChatConversationEntity } from "../../../../shared/types";

import { bindChatSocketEvents } from "./useChatSocketHandlers";

const EMPTY_TYPING_USERS: readonly string[] = [];

export function useChatData(conversationId: string | null) {
  const {
    getGetMessagesUseCase,
    getGetConversationByIdUseCase,
    getMarkMessageReadUseCase,
    getChatSocketService,
  } = useUseCases();
  const [conversationState, setConversationState] = useState<{
    readonly convId: string | null;
    readonly data: ChatConversationEntity | null;
  }>({ convId: conversationId, data: null });
  const conversation = conversationState.convId === conversationId ? conversationState.data : null;
  const requestSeqRef = useRef(0);
  const isFetchingMoreRef = useRef(false);
  const activeConversationIdRef = useRef(conversationId);

  useEffect(() => {
    activeConversationIdRef.current = conversationId;
  }, [conversationId]);

  const {
    conversationMessages,
    myNextCursor,
    myTypingUsers,
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
      conversationMessages: conversationId ? state.messages[conversationId] : undefined,
      myNextCursor: conversationId ? (state.nextCursors[conversationId] ?? null) : null,
      myTypingUsers: conversationId
        ? (state.typingUsers[conversationId] ?? EMPTY_TYPING_USERS)
        : EMPTY_TYPING_USERS,
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
    if (!conversationId || !conversationMessages) return [];
    return [...conversationMessages].reverse();
  }, [conversationMessages, conversationId]);

  const fetchData = useCallback(async () => {
    if (!conversationId) return;
    const reqSeq = ++requestSeqRef.current;
    setIsLoadingMessages(true);
    setError(null);

    try {
      const [convResult, msgResult] = await Promise.all([
        getGetConversationByIdUseCase.execute(conversationId),
        getGetMessagesUseCase.execute(conversationId),
      ]);

      if (reqSeq !== requestSeqRef.current || activeConversationIdRef.current !== conversationId) {
        return;
      }

      if (isErr(convResult)) {
        log.error("Failed to fetch conversation:", convResult.error);
      } else {
        setConversationState({ convId: conversationId, data: convResult.value });
      }

      if (isErr(msgResult)) {
        log.error("Failed to fetch messages:", msgResult.error);
        setError(msgResult.error.message);
      } else {
        setMessages(conversationId, msgResult.value.data, msgResult.value.nextCursor);
        let newestAgentMsg = null as (typeof msgResult.value.data)[number] | null;
        let newestTs = -Infinity;
        for (const msg of msgResult.value.data) {
          if (msg.senderType === "USER" || !msg.id) continue;
          const ts = Date.parse(msg.createdAt) || 0;
          if (ts >= newestTs) {
            newestTs = ts;
            newestAgentMsg = msg;
          }
        }
        if (newestAgentMsg?.id) {
          if (getChatSocketService.isConnected()) {
            getChatSocketService.markMessageRead(conversationId, newestAgentMsg.id);
          } else {
            void getMarkMessageReadUseCase.execute(conversationId, newestAgentMsg.id);
          }
        }
      }
    } finally {
      if (reqSeq === requestSeqRef.current && activeConversationIdRef.current === conversationId) {
        setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
        setIsLoadingMessages(false);
      }
    }
  }, [
    conversationId,
    getChatSocketService,
    getGetConversationByIdUseCase,
    getGetMessagesUseCase,
    getMarkMessageReadUseCase,
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
      void Promise.resolve(getChatSocketService.connect()).catch((err: unknown) => {
        log.warn("Failed to connect chat socket:", err);
      });
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
        if (active) {
          void fetchData();
        }
      }
    );

    return () => {
      active = false;
      requestSeqRef.current += 1;
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
    if (!conversationId || !myNextCursor || isLoadingMessages || isFetchingMoreRef.current) {
      return;
    }
    isFetchingMoreRef.current = true;
    setIsLoadingMessages(true);
    const targetConvId = conversationId;
    void getGetMessagesUseCase
      .execute(targetConvId, myNextCursor)
      .then((result) => {
        if (activeConversationIdRef.current !== targetConvId) return;
        if (!isErr(result)) {
          appendMessages(targetConvId, result.value.data, result.value.nextCursor);
        }
      })
      .finally(() => {
        isFetchingMoreRef.current = false;
        if (activeConversationIdRef.current === targetConvId) {
          setIsLoadingMessages(false);
        }
      });
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
    myTypingUsers: [...myTypingUsers],
    supportPresence,
    queueStatuses,
    outboundQueueCount,
    fetchData,
    loadMore,
  };
}
