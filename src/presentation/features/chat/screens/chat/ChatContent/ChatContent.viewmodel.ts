/** @format */

import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";

import { useUI } from "@/src/presentation/hooks";
import { useConnectivityStore } from "@/src/presentation/stores";

import { CHAT_CONSTANTS } from "../../../shared/constants";
import { useChatNavigation } from "../../../shared/hooks";

import type { ChatViewModel } from "./ChatContent.types";
import { useChatAttachments } from "./hooks/useChatAttachments";
import { useChatData } from "./hooks/useChatData";
import { useChatInput } from "./hooks/useChatInput";
import { useChatMessageActions } from "./hooks/useChatMessageActions";

export function useChatViewModel(propConversationId?: string): ChatViewModel {
  const { navigateBack, navigateToRoulette } = useChatNavigation();
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  const paramId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const conversationId = propConversationId ?? paramId ?? CHAT_CONSTANTS.DEFAULT_CONVERSATION_ID;

  const { t } = useUI();
  const setDemoOfflineOverride = useConnectivityStore((s) => s.setDemoOfflineOverride);
  const demoOfflineOverride = useConnectivityStore((s) => s.demoOfflineOverride);

  const {
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
  } = useChatData(conversationId);

  const { inputText, setInputText, stopTypingNow, clearInput } = useChatInput(conversationId);
  const {
    stagedAttachments,
    setStagedAttachments,
    pickAttachment,
    removeStagedAttachment,
    deleteAttachment,
  } = useChatAttachments(conversationId);

  const pruneStagedAttachments = useCallback(
    (sentKeys: ReadonlySet<string>) => {
      setStagedAttachments((prev) => prev.filter((a) => !sentKeys.has(a.localId ?? a.uri)));
    },
    [setStagedAttachments]
  );

  const {
    isSending,
    isNetworkOnline,
    sendMessage,
    handleRetryMessage,
    sendAudioNote,
    toggleReaction,
  } = useChatMessageActions({
    conversationId,
    stagedAttachments,
    pruneStagedAttachments,
    clearInput,
    stopTypingNow,
  });

  const toggleOfflineMode = useCallback(() => {
    setDemoOfflineOverride(!demoOfflineOverride);
  }, [demoOfflineOverride, setDemoOfflineOverride]);

  const isClosed =
    Boolean(conversation?.closedAt) ||
    conversation?.status === "CLOSED" ||
    conversation?.status === "RESOLVED";

  const queueStatus = queueStatuses[conversationId] ?? null;
  const headerSubtitle = isNetworkOnline
    ? t("chat.roomOnline", { count: conversation?.participantCount ?? 2 })
    : t("chat.roomOffline");

  return useMemo<ChatViewModel>(
    () => ({
      conversation,
      messages: invertedMessages,
      inputText,
      stagedAttachments,
      typingUsers: myTypingUsers,
      isLoading: isLoadingMessages,
      isSending,
      isError: Boolean(error),
      error,
      isClosed,
      supportPresence,
      queueStatus,
      headerSubtitle,
      isNetworkOnline,
      outboundQueueCount,
      setInputText,
      sendMessage,
      handleRetryMessage,
      sendAudioNote,
      pickAttachment,
      removeStagedAttachment,
      deleteAttachment,
      toggleReaction,
      toggleOfflineMode,
      spinNextMatch: navigateToRoulette,
      loadMore,
      refresh: fetchData,
      navigateBack,
    }),
    [
      conversation,
      deleteAttachment,
      error,
      fetchData,
      handleRetryMessage,
      headerSubtitle,
      inputText,
      invertedMessages,
      isClosed,
      isLoadingMessages,
      isNetworkOnline,
      isSending,
      loadMore,
      myTypingUsers,
      navigateBack,
      navigateToRoulette,
      outboundQueueCount,
      pickAttachment,
      queueStatus,
      removeStagedAttachment,
      sendAudioNote,
      sendMessage,
      setInputText,
      stagedAttachments,
      supportPresence,
      toggleOfflineMode,
      toggleReaction,
    ]
  );
}
