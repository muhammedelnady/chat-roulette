/** @format */
/**
 * Data Message Repository Implementation (REST Adapter)
 */

import { http } from "@/src/data/api";
import type { AttachmentDto, MessageDto, MessagesListResponse } from "@/src/data/api/dtos/chat";
import {
  attachmentDtoSchema,
  messageDtoSchema,
  messagesListResponseSchema,
  uploadAudioResultSchema,
} from "@/src/data/api/dtos/chat/schemas";
import type { ApiResponse } from "@/src/data/api/dtos/common";
import {
  CHAT_ATTACHMENT_DELETE_API,
  CHAT_UPLOAD_API,
  CHAT_UPLOAD_AUDIO_API,
  MESSAGES_API,
  MESSAGE_REACTION_API,
  MESSAGE_READ_API,
  MESSAGE_SEND_API,
  buildApiUrl,
} from "@/src/data/api/endpoints";
import { mapMessageDtoToEntity } from "@/src/data/mappers/ChatMapper";
import type {
  MessageAttachmentEntity,
  MessageAttachmentInput,
  MessageEntity,
} from "@/src/domain/entities";
import { NetworkError, SerializationError, type AppError } from "@/src/domain/errors";
import type { IMessageRepository, UploadAudioResult } from "@/src/domain/repositories";
import { err, ok, type Result } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";

import { BaseRepository } from "./BaseRepository";

const CACHE_TTL_MS = 60_000;
const UPLOAD_TIMEOUT_MS = 60_000;

export class MessageRepositoryImpl extends BaseRepository implements IMessageRepository {
  async list(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: MessageEntity[]; nextCursor: string | null }, AppError>> {
    const cacheKey = `chat:messages:${conversationId}:${cursor ?? "first"}:${limit ?? "default"}`;

    if (!this.isOnline()) {
      const cached = this.cacheManager.getStaleFallback<{
        data: MessageEntity[];
        nextCursor: string | null;
      }>(cacheKey);
      if (cached) return ok(cached);
      return err(new NetworkError("Cannot fetch messages while offline"));
    }

    try {
      const params: Record<string, string> = {};
      if (cursor) params["cursor"] = cursor;
      if (limit) params["limit"] = String(limit);
      const url = buildApiUrl(MESSAGES_API, { conversationId });
      const response = await http.get<ApiResponse<MessagesListResponse>>(url, { params });
      const parsed = messagesListResponseSchema.safeParse(response.data);
      if (!parsed.success) {
        return err(
          new SerializationError("Invalid messages list response", {
            issues: parsed.error.issues,
          })
        );
      }
      const resultValue = {
        data: parsed.data.data.map(mapMessageDtoToEntity),
        nextCursor: parsed.data.nextCursor,
      };
      this.cacheManager.set(cacheKey, resultValue, CACHE_TTL_MS);
      return ok(resultValue);
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
      const { conversationId, ...body } = params;
      const url = buildApiUrl(MESSAGE_SEND_API, { conversationId });
      const response = await http.post<ApiResponse<MessageDto>>(url, body);
      const parsed = messageDtoSchema.safeParse(response.data);
      if (!parsed.success) {
        return err(
          new SerializationError("Invalid send message response", {
            issues: parsed.error.issues,
          })
        );
      }
      this.cacheManager.invalidatePrefix(`chat:messages:${conversationId}:`);
      this.cacheManager.invalidatePrefix("chat:conversations:");
      return ok(mapMessageDtoToEntity(parsed.data));
    } catch (error) {
      log.error("Failed to send message:", error);
      return err(this.handleError(error, "sendMessage", "MESSAGE_SEND_FAILED"));
    }
  }

  async markRead(conversationId: string, messageId: string): Promise<Result<void, AppError>> {
    try {
      const url = buildApiUrl(MESSAGE_READ_API, { id: conversationId });
      await http.post(url, { messageId });
      this.cacheManager.invalidatePrefix("chat:conversations:");
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
      const url = buildApiUrl(MESSAGE_REACTION_API, { conversationId, messageId });
      const response = await http.post<ApiResponse<MessageDto | null>>(url, { emoji });
      if (!response.data) {
        return ok(null);
      }
      const parsed = messageDtoSchema.safeParse(response.data);
      if (!parsed.success) {
        return err(
          new SerializationError("Invalid reaction response", {
            issues: parsed.error.issues,
          })
        );
      }
      this.cacheManager.invalidatePrefix(`chat:messages:${conversationId}:`);
      return ok(mapMessageDtoToEntity(parsed.data));
    } catch (error) {
      log.error("Failed to toggle message reaction:", error);
      return err(this.handleError(error, "toggleReaction", "MESSAGE_REACTION_FAILED"));
    }
  }

  async uploadAttachment(formData: FormData): Promise<Result<MessageAttachmentEntity, AppError>> {
    try {
      const response = await http.post<ApiResponse<AttachmentDto>>(CHAT_UPLOAD_API, formData, {
        timeout: UPLOAD_TIMEOUT_MS,
      });
      const parsed = attachmentDtoSchema.safeParse(response.data);
      if (!parsed.success) {
        return err(
          new SerializationError("Invalid attachment upload response", {
            issues: parsed.error.issues,
          })
        );
      }
      const dto = parsed.data;
      const id = dto.id ?? dto.uploadId;
      const url = dto.url;
      if (!id || !url) {
        return err(new SerializationError("Attachment upload response missing id or url"));
      }
      return ok({
        ...dto,
        id,
        url,
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
          timeout: UPLOAD_TIMEOUT_MS,
        }
      );
      const parsed = uploadAudioResultSchema.safeParse(response.data);
      if (!parsed.success) {
        return err(
          new SerializationError("Invalid audio upload response", {
            issues: parsed.error.issues,
          })
        );
      }
      return ok(parsed.data);
    } catch (error) {
      log.error("Failed to upload audio:", error);
      return err(this.handleError(error, "uploadAudio", "AUDIO_UPLOAD_FAILED"));
    }
  }

  async deleteAttachment(attachmentId: string): Promise<Result<void, AppError>> {
    try {
      const url = buildApiUrl(CHAT_ATTACHMENT_DELETE_API, { attachmentId });
      await http.delete(url);
      return ok(undefined);
    } catch (error) {
      log.error("Failed to delete attachment:", error);
      return err(this.handleError(error, "deleteAttachment", "ATTACHMENT_DELETE_FAILED"));
    }
  }
}
