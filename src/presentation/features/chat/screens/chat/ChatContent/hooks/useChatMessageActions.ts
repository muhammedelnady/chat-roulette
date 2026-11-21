/** @format */

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useShallow } from "zustand/shallow";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { generateUUID } from "@/src/domain/utils/uuid";
import { log } from "@/src/infrastructure/logging/logger";
import { useUI } from "@/src/presentation/hooks";
import { useChatStore, useIsOnline } from "@/src/presentation/stores";

import type {
  ChatAttachmentEntity,
  ChatMessageEntity,
  StagedAttachment,
} from "../../../../shared/types";
import { createFileFormData, mapAttachmentEntity } from "../ChatContent.mappers";
import type { SendMessageOptions } from "../ChatContent.types";

interface UseChatMessageActionsParams {
  readonly conversationId: string;
  readonly stagedAttachments: readonly StagedAttachment[];
  readonly pruneStagedAttachments: (sentKeys: ReadonlySet<string>) => void;
  readonly clearInput: () => void;
  readonly stopTypingNow: () => void;
}

export function useChatMessageActions({
  conversationId,
  stagedAttachments,
  pruneStagedAttachments,
  clearInput,
  stopTypingNow,
}: UseChatMessageActionsParams) {
  const {
    getChatSocketService,
    getSendMessageUseCase,
    getUploadAudioUseCase,
    getToggleMessageReactionUseCase,
  } = useUseCases();
  const { t } = useUI();
  const isNetworkOnline = useIsOnline();

  const { upsertMessage, updateMessageStatus, toggleMessageReaction, setOutboundQueueCount } =
    useChatStore(
      useShallow((state) => ({
        upsertMessage: state.upsertMessage,
        updateMessageStatus: state.updateMessageStatus,
        toggleMessageReaction: state.toggleMessageReaction,
        setOutboundQueueCount: state.setOutboundQueueCount,
      }))
    );

  const [isSending, setIsSending] = useState(false);
  const isSendingMsgRef = useRef(false);
  const activeConvRef = useRef(conversationId);

  useEffect(() => {
    activeConvRef.current = conversationId;
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string, options: SendMessageOptions = {}) => {
      if (isSendingMsgRef.current) return;
      const includeStaged = options.includeStagedAttachments !== false;
      const readyStaged = includeStaged
        ? stagedAttachments.filter((att) => Boolean(att.uploadedAttachment) && !att.isUploading)
        : [];
      const attachmentsToSend = readyStaged
        .map((att) => att.uploadedAttachment)
        .filter((att): att is ChatAttachmentEntity => Boolean(att));

      const trimmed = content.trim();
      if (!trimmed && attachmentsToSend.length === 0) return;

      isSendingMsgRef.current = true;
      try {
        const clientId = generateUUID();
        const optimistic: ChatMessageEntity = {
          id: clientId,
          clientId,
          conversationId,
          senderType: "USER",
          senderName: "You",
          content: trimmed || null,
          contentType: attachmentsToSend.length > 0 ? "attachment" : "text",
          status: "PENDING",
          metadata: null,
          isEdited: false,
          deletedAt: null,
          createdAt: new Date().toISOString(),
          attachments: attachmentsToSend,
        };

        upsertMessage(conversationId, optimistic);
        if (includeStaged) {
          clearInput();
          if (readyStaged.length > 0) {
            pruneStagedAttachments(new Set(readyStaged.map((a) => a.localId ?? a.uri)));
          }
        } else {
          stopTypingNow();
        }

        const formattedAttachments = attachmentsToSend.map(mapAttachmentEntity);
        if (getChatSocketService.isConnected() || !isNetworkOnline) {
          getChatSocketService.sendMessage({
            conversationId,
            clientId,
            content: trimmed || undefined,
            attachments: formattedAttachments.length > 0 ? formattedAttachments : undefined,
          });
          setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
        } else {
          const res = await getSendMessageUseCase.execute({
            conversationId,
            content: trimmed,
            clientId,
            attachments: attachmentsToSend,
          });
          if (isErr(res)) {
            log.error("Failed to send message via REST:", res.error);
            updateMessageStatus(conversationId, clientId, "FAILED");
          } else {
            upsertMessage(conversationId, res.value);
          }
        }
      } finally {
        isSendingMsgRef.current = false;
      }
    },
    [
      clearInput,
      conversationId,
      getChatSocketService,
      getSendMessageUseCase,
      isNetworkOnline,
      pruneStagedAttachments,
      setOutboundQueueCount,
      stagedAttachments,
      stopTypingNow,
      updateMessageStatus,
      upsertMessage,
    ]
  );

  const handleRetryMessage = useCallback(
    async (message: ChatMessageEntity) => {
      updateMessageStatus(conversationId, message.clientId, "PENDING");
      if (getChatSocketService.isConnected() || !isNetworkOnline) {
        getChatSocketService.sendMessage({
          conversationId,
          clientId: message.clientId,
          content: message.content?.trim() ? message.content.trim() : undefined,
          contentType: message.contentType,
          metadata: message.metadata,
          attachments: message.attachments.map(mapAttachmentEntity),
        });
        setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
        return;
      }

      const res = await getSendMessageUseCase.execute({
        conversationId,
        content: message.content ?? "",
        contentType: message.contentType,
        metadata: message.metadata,
        clientId: message.clientId,
        attachments: message.attachments,
      });
      if (isErr(res)) {
        updateMessageStatus(conversationId, message.clientId, "FAILED");
      } else {
        upsertMessage(conversationId, res.value);
      }
    },
    [
      conversationId,
      getChatSocketService,
      getSendMessageUseCase,
      isNetworkOnline,
      setOutboundQueueCount,
      updateMessageStatus,
      upsertMessage,
    ]
  );

  const sendAudioNote = useCallback(
    async (audioData: { uri: string; duration: number; name?: string; type?: string }) => {
      setIsSending(true);
      const targetConvId = conversationId;
      const clientId = generateUUID();

      try {
        const formData = createFileFormData(
          audioData.uri,
          audioData.name ?? `audio_${Date.now()}.m4a`,
          audioData.type ?? "audio/m4a"
        );
        const uploadRes = await getUploadAudioUseCase.execute(formData);
        if (activeConvRef.current !== targetConvId) return;

        if (isErr(uploadRes)) {
          log.error("Failed to upload audio:", uploadRes.error);
          Alert.alert(t("common.error"), t("chat.audioUploadFailed"));
          upsertMessage(targetConvId, {
            id: clientId,
            clientId,
            conversationId: targetConvId,
            senderType: "USER",
            senderName: "You",
            content: null,
            contentType: "AUDIO",
            status: "FAILED",
            metadata: {
              duration: audioData.duration,
              waveform: [0.25, 0.55, 0.85, 0.7, 0.9, 0.45, 0.75, 0.35],
            },
            isEdited: false,
            deletedAt: null,
            createdAt: new Date().toISOString(),
            attachments: [],
          });
          return;
        }

        const audioMetadata = {
          audioUrl: uploadRes.value.url,
          duration:
            uploadRes.value.durationSeconds > 0
              ? uploadRes.value.durationSeconds
              : audioData.duration,
          waveform: uploadRes.value.waveformBars,
        };

        upsertMessage(targetConvId, {
          id: clientId,
          clientId,
          conversationId: targetConvId,
          senderType: "USER",
          senderName: "You",
          content: uploadRes.value.url,
          contentType: "AUDIO",
          status: "PENDING",
          metadata: audioMetadata,
          isEdited: false,
          deletedAt: null,
          createdAt: new Date().toISOString(),
          attachments: [],
        });

        getChatSocketService.sendMessage({
          conversationId: targetConvId,
          clientId,
          content: uploadRes.value.url,
          contentType: "AUDIO",
          metadata: audioMetadata,
        });
        setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
      } finally {
        setIsSending(false);
      }
    },
    [
      conversationId,
      getChatSocketService,
      getUploadAudioUseCase,
      setOutboundQueueCount,
      t,
      upsertMessage,
    ]
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      toggleMessageReaction(conversationId, messageId, emoji);
      const res = await getToggleMessageReactionUseCase.execute(conversationId, messageId, emoji);
      if (isErr(res)) {
        log.error("Failed to toggle reaction, reverting:", res.error);
        toggleMessageReaction(conversationId, messageId, emoji);
      } else if (res.value) {
        upsertMessage(conversationId, res.value);
      }
    },
    [conversationId, getToggleMessageReactionUseCase, toggleMessageReaction, upsertMessage]
  );

  return {
    isSending,
    isNetworkOnline,
    sendMessage,
    handleRetryMessage,
    sendAudioNote,
    toggleReaction,
  };
}
