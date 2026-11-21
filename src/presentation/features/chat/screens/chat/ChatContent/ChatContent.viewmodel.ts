/** @format */

import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useShallow } from "zustand/shallow";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { generateUUID } from "@/src/domain/utils/uuid";
import { log } from "@/src/infrastructure/logging/logger";
import { useUI } from "@/src/presentation/hooks";
import { useChatStore, useConnectivityStore, useIsOnline } from "@/src/presentation/stores";

import { CHAT_CONSTANTS } from "../../../shared/constants";
import { useChatNavigation } from "../../../shared/hooks";
import type { ChatAttachmentEntity, ChatMessageEntity } from "../../../shared/types";

import { mapAttachmentEntity } from "./ChatContent.mappers";
import type { ChatViewModel } from "./ChatContent.types";
import { useChatAttachments } from "./hooks/useChatAttachments";
import { useChatData } from "./hooks/useChatData";
import { useChatInput } from "./hooks/useChatInput";

export function useChatViewModel(propConversationId?: string): ChatViewModel {
  const { navigateBack, navigateToRoulette } = useChatNavigation();
  const params = useLocalSearchParams<{ conversationId?: string }>();
  const conversationId =
    propConversationId ?? params.conversationId ?? CHAT_CONSTANTS.DEFAULT_CONVERSATION_ID;

  const { getChatSocketService, getUploadAudioUseCase, getToggleMessageReactionUseCase } =
    useUseCases();
  const { t } = useUI();
  const isNetworkOnline = useIsOnline();
  const setDemoOfflineOverride = useConnectivityStore((s) => s.setDemoOfflineOverride);
  const demoOfflineOverride = useConnectivityStore((s) => s.demoOfflineOverride);

  const { upsertMessage, updateMessageStatus, toggleMessageReaction, setOutboundQueueCount } =
    useChatStore(
      useShallow((state) => ({
        upsertMessage: state.upsertMessage,
        updateMessageStatus: state.updateMessageStatus,
        toggleMessageReaction: state.toggleMessageReaction,
        setOutboundQueueCount: state.setOutboundQueueCount,
      }))
    );

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

  const { inputText, setInputText, isTypingRef, clearInput } = useChatInput(conversationId);
  const {
    stagedAttachments,
    setStagedAttachments,
    pickAttachment,
    removeStagedAttachment,
    deleteAttachment,
  } = useChatAttachments(conversationId);

  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const attachmentsToSend = stagedAttachments
        .map((att) => att.uploadedAttachment)
        .filter((att): att is ChatAttachmentEntity => Boolean(att));

      if (!content.trim() && attachmentsToSend.length === 0) return;

      const clientId = generateUUID();

      const optimistic: ChatMessageEntity = {
        id: clientId,
        clientId,
        conversationId,
        senderType: "USER",
        senderName: "You",
        content: content.trim() ? content.trim() : null,
        contentType: attachmentsToSend.length > 0 ? "attachment" : "text",
        status: "PENDING",
        metadata: null,
        isEdited: false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        attachments: attachmentsToSend,
      };

      upsertMessage(conversationId, optimistic);
      clearInput();
      setStagedAttachments([]);

      if (isTypingRef.current) {
        isTypingRef.current = false;
        getChatSocketService.stopTyping(conversationId);
      }

      const formattedAttachments = attachmentsToSend.map(mapAttachmentEntity);

      getChatSocketService.sendMessage({
        conversationId,
        clientId,
        content: content.trim() ? content.trim() : undefined,
        attachments: formattedAttachments.length > 0 ? formattedAttachments : undefined,
      });
      setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
      await Promise.resolve();
    },
    [
      conversationId,
      getChatSocketService,
      stagedAttachments,
      upsertMessage,
      clearInput,
      setStagedAttachments,
      isTypingRef,
      setOutboundQueueCount,
    ]
  );

  const handleRetryMessage = useCallback(
    async (message: ChatMessageEntity) => {
      updateMessageStatus(conversationId, message.clientId, "PENDING");
      getChatSocketService.sendMessage({
        conversationId,
        clientId: message.clientId,
        content: message.content?.trim() ? message.content.trim() : undefined,
        contentType: message.contentType,
        metadata: message.metadata,
        attachments: message.attachments.map(mapAttachmentEntity),
      });
      setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
      await Promise.resolve();
    },
    [conversationId, updateMessageStatus, getChatSocketService, setOutboundQueueCount]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      await handleSendMessage(content);
    },
    [handleSendMessage]
  );

  const sendAudioNote = useCallback(
    async (audioData: { uri: string; duration: number; name?: string; type?: string }) => {
      setIsSending(true);
      const clientId = generateUUID();

      const formData = new FormData();
      formData.append("file", {
        uri: audioData.uri,
        name: audioData.name ?? `audio_${Date.now()}.m4a`,
        type: audioData.type ?? "audio/m4a",
      } as unknown as Blob);

      let finalAudioUrl = audioData.uri;
      let finalWaveform: number[] = [0.25, 0.55, 0.85, 0.7, 0.9, 0.45, 0.75, 0.35];
      let finalDuration = audioData.duration;

      const uploadRes = await getUploadAudioUseCase.execute(formData);
      if (!isErr(uploadRes)) {
        finalAudioUrl = uploadRes.value.url;
        finalWaveform = uploadRes.value.waveformBars;
        finalDuration =
          uploadRes.value.durationSeconds > 0
            ? uploadRes.value.durationSeconds
            : audioData.duration;
      } else {
        log.error("Failed to upload audio, sending with local fallback:", uploadRes.error);
      }

      const audioMetadata = {
        audioUrl: finalAudioUrl,
        duration: finalDuration,
        waveform: finalWaveform,
      };

      const optimistic: ChatMessageEntity = {
        id: clientId,
        clientId,
        conversationId,
        senderType: "USER",
        senderName: "You",
        content: finalAudioUrl,
        contentType: "AUDIO",
        status: "PENDING",
        metadata: audioMetadata,
        isEdited: false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        attachments: [],
      };

      upsertMessage(conversationId, optimistic);
      getChatSocketService.sendMessage({
        conversationId,
        clientId,
        content: finalAudioUrl,
        contentType: "AUDIO",
        metadata: audioMetadata,
      });
      setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
      setIsSending(false);
    },
    [
      conversationId,
      getChatSocketService,
      getUploadAudioUseCase,
      upsertMessage,
      setOutboundQueueCount,
    ]
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      toggleMessageReaction(conversationId, messageId, emoji);
      await getToggleMessageReactionUseCase.execute(conversationId, messageId, emoji);
    },
    [conversationId, getToggleMessageReactionUseCase, toggleMessageReaction]
  );

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

  return {
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
  };
}
