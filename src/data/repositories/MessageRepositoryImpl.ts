/** @format */
/**
 * Data Message Repository Implementation (REST Adapter)
 */

import { http } from "@/src/data/api";
import type { AttachmentDto, MessageDto, MessagesListResponse } from "@/src/data/api/dtos/chat";
import type { ApiResponse } from "@/src/data/api/dtos/common";
import {
  CHAT_ATTACHMENT_DELETE_API,
  CHAT_UPLOAD_API,
  CHAT_UPLOAD_AUDIO_API,
  CONVERSATION_BY_ID_API,
  MESSAGES_API,
  MESSAGE_REACTION_API,
  MESSAGE_SEND_API,
} from "@/src/data/api/endpoints";
import { mapMessageDtoToEntity } from "@/src/data/mappers/ChatMapper";
import { log } from "@/src/data/utils/logger";
import type {
  MessageAttachmentEntity,
  MessageAttachmentInput,
  MessageEntity,
} from "@/src/domain/entities";
import type { AppError } from "@/src/domain/errors";
import type { IMessageRepository, UploadAudioResult } from "@/src/domain/repositories";
import { err, ok, type Result } from "@/src/domain/Result";

import { BaseRepository } from "./BaseRepository";

export class MessageRepositoryImpl extends BaseRepository implements IMessageRepository {
  async list(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: MessageEntity[]; nextCursor: string | null }, AppError>> {
    try {
      const params: Record<string, string> = {};
      if (cursor) params["cursor"] = cursor;
      if (limit) params["limit"] = String(limit);
      const url = MESSAGES_API.replace(":conversationId", conversationId);
      const response = await http.get<ApiResponse<MessagesListResponse>>(url, { params });
      const data = response.data;
      return ok({
        data: data.data.map(mapMessageDtoToEntity),
        nextCursor: data.nextCursor,
      });
    } catch (error) {
      log.error(`Failed to fetch messages for ${conversationId}:`, error);
      return err(this.handleError(error, "getMessages", "MESSAGES_FETCH_FAILED"));
    }
  }

  async send(params: {
    conversationId: string;
    content: string;
    contentType?: string;
    metadata?: Record<string, unknown> | null;
    clientId?: string;
    replyToId?: string;
    attachments?: (MessageAttachmentEntity | MessageAttachmentInput)[];
  }): Promise<Result<MessageEntity, AppError>> {
    try {
      const url = MESSAGE_SEND_API.replace(":conversationId", params.conversationId);
      const response = await http.post<ApiResponse<MessageDto>>(url, params);
      return ok(mapMessageDtoToEntity(response.data));
    } catch (error) {
      log.error("Failed to send message:", error);
      return err(this.handleError(error, "sendMessage", "MESSAGE_SEND_FAILED"));
    }
  }

  async markRead(conversationId: string, messageId: string): Promise<Result<void, AppError>> {
    try {
      const url = CONVERSATION_BY_ID_API.replace(":id", conversationId) + "/read";
      await http.post(url, { messageId });
      return ok(undefined);
    } catch (error) {
      log.error("Failed to mark message read:", error);
      return err(this.handleError(error, "markRead", "MESSAGE_READ_FAILED"));
    }
  }

  async toggleReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<Result<MessageEntity | null, AppError>> {
    try {
      const url = MESSAGE_REACTION_API.replace(":conversationId", conversationId).replace(
        ":messageId",
        messageId
      );
      const response = await http.post<ApiResponse<MessageDto>>(url, { emoji });
      return ok(mapMessageDtoToEntity(response.data));
    } catch (error) {
      log.error("Failed to toggle message reaction:", error);
      return err(this.handleError(error, "toggleReaction", "MESSAGE_REACTION_FAILED"));
    }
  }

  async uploadAttachment(formData: FormData): Promise<Result<MessageAttachmentEntity, AppError>> {
    try {
      const response = await http.post<ApiResponse<AttachmentDto>>(CHAT_UPLOAD_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const dto = response.data;
      return ok({
        ...dto,
        id: dto.id ?? dto.uploadId ?? "",
        url: dto.url ?? "",
      });
    } catch (error) {
      log.error("Failed to upload attachment:", error);
      return err(this.handleError(error, "uploadAttachment", "ATTACHMENT_UPLOAD_FAILED"));
    }
  }

  async uploadAudio(formData: FormData): Promise<Result<UploadAudioResult, AppError>> {
    try {
      const response = await http.post<ApiResponse<UploadAudioResult>>(
        CHAT_UPLOAD_AUDIO_API,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return ok(response.data);
    } catch (error) {
      log.error("Failed to upload audio:", error);
      return err(this.handleError(error, "uploadAudio", "AUDIO_UPLOAD_FAILED"));
    }
  }

  async deleteAttachment(attachmentId: string): Promise<Result<void, AppError>> {
    try {
      const url = CHAT_ATTACHMENT_DELETE_API.replace(":attachmentId", attachmentId);
      await http.delete(url);
      return ok(undefined);
    } catch (error) {
      log.error("Failed to delete attachment:", error);
      return err(this.handleError(error, "deleteAttachment", "ATTACHMENT_DELETE_FAILED"));
    }
  }
}
