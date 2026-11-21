/** @format */

import type {
  MessageAttachmentEntity,
  MessageAttachmentInput,
  MessageEntity,
} from "@/src/domain/entities";
import { type AppError, ValidationError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, type Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class SendMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(params: {
    conversationId: string;
    content: string;
    contentType?: string;
    metadata?: Record<string, unknown> | null;
    clientId?: string;
    replyToId?: string;
    attachments?: (MessageAttachmentEntity | MessageAttachmentInput)[];
  }): Promise<Result<MessageEntity, AppError>> {
    if (!params.conversationId.trim()) {
      return err(new ValidationError("Conversation ID is required", "conversationId"));
    }
    const hasContent = params.content.trim().length > 0;
    const hasAttachments = (params.attachments?.length ?? 0) > 0;
    if (!hasContent && !hasAttachments) {
      return err(new ValidationError("Message content or attachment is required", "content"));
    }
    return safeExecute(
      () => this.messageRepository.send(params),
      "Failed to send message",
      "MESSAGE_SEND_FAILED"
    );
  }
}
