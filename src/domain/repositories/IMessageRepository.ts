/** @format */
/**
 * Domain IMessage Repository
 */

import type {
  MessageAttachmentEntity,
  MessageAttachmentInput,
  MessageEntity,
} from "@/src/domain/entities";
import type { AppError } from "@/src/domain/errors";
import type { Result } from "@/src/domain/Result";

export interface UploadAudioResult {
  readonly uploadId: string;
  readonly url: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly fileSize: number;
  readonly durationSeconds: number;
  readonly waveformBars: number[];
}

export interface IMessageRepository {
  list(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: MessageEntity[]; nextCursor: string | null }, AppError>>;
  send(params: {
    conversationId: string;
    content: string;
    contentType?: string;
    metadata?: Record<string, unknown> | null;
    clientId?: string;
    replyToId?: string;
    attachments?: (MessageAttachmentEntity | MessageAttachmentInput)[];
  }): Promise<Result<MessageEntity, AppError>>;
  markRead(conversationId: string, messageId: string): Promise<Result<void, AppError>>;
  toggleReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<Result<MessageEntity | null, AppError>>;
  uploadAttachment(formData: FormData): Promise<Result<MessageAttachmentEntity, AppError>>;
  uploadAudio(formData: FormData): Promise<Result<UploadAudioResult, AppError>>;
  deleteAttachment(attachmentId: string): Promise<Result<void, AppError>>;
}
