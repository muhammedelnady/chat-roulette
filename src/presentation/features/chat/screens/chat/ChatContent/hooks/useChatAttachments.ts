/** @format */

import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useShallow } from "zustand/shallow";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";
import { useUI } from "@/src/presentation/hooks";
import { useChatStore } from "@/src/presentation/stores";

import { CHAT_CONSTANTS } from "../../../../shared/constants";
import type { StagedAttachment } from "../../../../shared/types";

export function useChatAttachments(conversationId: string | null) {
  const { getUploadAttachmentUseCase, getDeleteAttachmentUseCase } = useUseCases();
  const { t } = useUI();
  const { removeAttachment } = useChatStore(
    useShallow((state) => ({ removeAttachment: state.removeAttachment }))
  );
  const [stagedAttachments, setStagedAttachments] = useState<StagedAttachment[]>([]);

  const stageAttachment = useCallback(
    async (file: { uri: string; name: string; type: string; size?: number }) => {
      const item: StagedAttachment = {
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

        if (!isErr(result)) {
          const uploaded = result.value;
          setStagedAttachments((prev) =>
            prev.map((att) =>
              att.uri === file.uri
                ? { ...att, isUploading: false, uploadedAttachment: uploaded }
                : att
            )
          );
        } else {
          log.error("Failed to upload attachment:", result.error);
          setStagedAttachments((prev) => prev.filter((att) => att.uri !== file.uri));
        }
      } catch (err) {
        log.error("Failed to upload attachment:", err);
        setStagedAttachments((prev) => prev.filter((att) => att.uri !== file.uri));
      }
    },
    [getUploadAttachmentUseCase]
  );

  const pickAttachment = useCallback(async () => {
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
        selectionLimit: CHAT_CONSTANTS.ATTACHMENT_MAX_COUNT,
      });

      if (!result.canceled) {
        for (const asset of result.assets) {
          const fileName = asset.fileName ?? `photo_${Date.now()}.jpg`;
          const mimeType = asset.mimeType ?? "image/jpeg";
          void stageAttachment({
            uri: asset.uri,
            name: fileName,
            type: mimeType,
            size: asset.fileSize,
          });
        }
      }
    } catch {
      Alert.alert(t("chat.permissionDenied"), t("chat.failedToPickImage"));
    }
  }, [stageAttachment, t]);

  const removeStagedAttachment = useCallback((uri: string) => {
    setStagedAttachments((prev) => prev.filter((att) => att.uri !== uri));
  }, []);

  const deleteAttachment = useCallback(
    async (attachmentId: string, messageId?: string) => {
      if (messageId && conversationId) {
        removeAttachment(conversationId, messageId, attachmentId);
      }
      const result = await getDeleteAttachmentUseCase.execute(attachmentId);
      if (isErr(result)) {
        log.error("Failed to delete attachment:", result.error);
      }
    },
    [conversationId, getDeleteAttachmentUseCase, removeAttachment]
  );

  return {
    stagedAttachments,
    setStagedAttachments,
    pickAttachment,
    removeStagedAttachment,
    deleteAttachment,
  };
}
