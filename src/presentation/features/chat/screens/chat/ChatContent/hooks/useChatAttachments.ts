/** @format */

import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useShallow } from "zustand/shallow";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { generateUUID } from "@/src/domain/utils/uuid";
import { log } from "@/src/infrastructure/logging/logger";
import { useUI } from "@/src/presentation/hooks";
import { useChatStore } from "@/src/presentation/stores";

import { CHAT_CONSTANTS } from "../../../../shared/constants";
import type { StagedAttachment } from "../../../../shared/types";

export function useChatAttachments(conversationId: string | null) {
  const { getUploadAttachmentUseCase, getDeleteAttachmentUseCase } = useUseCases();
  const { t } = useUI();
  const { removeAttachment, restoreAttachment } = useChatStore(
    useShallow((state) => ({
      removeAttachment: state.removeAttachment,
      restoreAttachment: state.upsertMessage,
    }))
  );
  const [stagedAttachments, setStagedAttachments] = useState<StagedAttachment[]>([]);
  const stagedRef = useRef<StagedAttachment[]>([]);
  const cancelledLocalIdsRef = useRef<Set<string>>(new Set());
  const activeConversationIdRef = useRef(conversationId);

  useEffect(() => {
    stagedRef.current = stagedAttachments;
  }, [stagedAttachments]);

  useEffect(() => {
    activeConversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    const cancelledIds = cancelledLocalIdsRef.current;
    return () => {
      const stale = stagedRef.current;
      for (const att of stale) {
        if (att.localId) {
          cancelledIds.add(att.localId);
        }
        const uploadedId = att.uploadedAttachment?.id ?? att.uploadedAttachment?.uploadId;
        if (uploadedId) {
          void getDeleteAttachmentUseCase.execute(uploadedId);
        }
      }
      setStagedAttachments([]);
    };
  }, [conversationId, getDeleteAttachmentUseCase]);

  const stageAttachment = useCallback(
    async (file: { uri: string; name: string; type: string; size?: number }) => {
      const localId = generateUUID();
      const targetConvId = activeConversationIdRef.current;
      const item: StagedAttachment = {
        localId,
        uri: file.uri,
        name: file.name,
        type: file.type,
        size: file.size ?? 0,
        isUploading: true,
      };
      setStagedAttachments((prev) => [...prev, item]);

      try {
        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as unknown as Blob);

        const result = await getUploadAttachmentUseCase.execute(formData);
        const wasCancelled =
          cancelledLocalIdsRef.current.has(localId) ||
          activeConversationIdRef.current !== targetConvId;

        if (!isErr(result)) {
          const uploaded = result.value;
          if (wasCancelled) {
            const uploadedId = uploaded.id || uploaded.uploadId;
            if (uploadedId) {
              void getDeleteAttachmentUseCase.execute(uploadedId);
            }
            return;
          }
          setStagedAttachments((prev) =>
            prev.map((att) =>
              att.localId === localId
                ? { ...att, isUploading: false, uploadedAttachment: uploaded }
                : att
            )
          );
        } else if (!wasCancelled) {
          log.error("Failed to upload attachment:", result.error);
          setStagedAttachments((prev) => prev.filter((att) => att.localId !== localId));
          Alert.alert(t("common.error"), t("chat.uploadFailed"));
        }
      } catch (err) {
        log.error("Failed to upload attachment:", err);
        setStagedAttachments((prev) => prev.filter((att) => att.localId !== localId));
        Alert.alert(t("common.error"), t("chat.uploadFailed"));
      }
    },
    [getDeleteAttachmentUseCase, getUploadAttachmentUseCase, t]
  );

  const pickAttachment = useCallback(async () => {
    const remainingSlots = CHAT_CONSTANTS.ATTACHMENT_MAX_COUNT - stagedRef.current.length;
    if (remainingSlots <= 0) {
      Alert.alert(
        t("common.error"),
        t("chat.maxAttachmentsReached", { count: CHAT_CONSTANTS.ATTACHMENT_MAX_COUNT })
      );
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t("chat.permissionDenied"), t("chat.photoLibraryPermissionRequired"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled) {
        result.assets.slice(0, remainingSlots).forEach((asset, index) => {
          const fileName = asset.fileName ?? `photo_${Date.now()}_${index}.jpg`;
          const mimeType = asset.mimeType ?? "image/jpeg";
          void stageAttachment({
            uri: asset.uri,
            name: fileName,
            type: mimeType,
            size: asset.fileSize,
          });
        });
      }
    } catch {
      Alert.alert(t("chat.permissionDenied"), t("chat.failedToPickImage"));
    }
  }, [stageAttachment, t]);

  const removeStagedAttachment = useCallback(
    (idOrUri: string) => {
      const target = stagedRef.current.find(
        (att) => att.localId === idOrUri || att.uri === idOrUri
      );
      if (target?.localId) {
        cancelledLocalIdsRef.current.add(target.localId);
      }
      const uploadedId = target?.uploadedAttachment?.id ?? target?.uploadedAttachment?.uploadId;
      if (uploadedId) {
        void getDeleteAttachmentUseCase.execute(uploadedId);
      }
      setStagedAttachments((prev) =>
        prev.filter((att) => att.localId !== idOrUri && att.uri !== idOrUri)
      );
    },
    [getDeleteAttachmentUseCase]
  );

  const deleteAttachment = useCallback(
    async (attachmentId: string, messageId?: string) => {
      const previousMsg =
        messageId && conversationId
          ? useChatStore
              .getState()
              .messages[conversationId]?.find((m) => m.id === messageId || m.clientId === messageId)
          : undefined;

      if (messageId && conversationId) {
        removeAttachment(conversationId, messageId, attachmentId);
      }
      const result = await getDeleteAttachmentUseCase.execute(attachmentId);
      if (isErr(result)) {
        log.error("Failed to delete attachment:", result.error);
        if (previousMsg && conversationId) {
          restoreAttachment(conversationId, previousMsg);
        }
      }
    },
    [conversationId, getDeleteAttachmentUseCase, removeAttachment, restoreAttachment]
  );

  return {
    stagedAttachments,
    setStagedAttachments,
    pickAttachment,
    removeStagedAttachment,
    deleteAttachment,
  };
}
