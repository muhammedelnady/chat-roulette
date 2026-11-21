/** @format */

import type {
  MessageAttachmentEntity,
  MessageAttachmentInput,
  MessageEntity,
} from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class SendMessageUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(params: {
    conversationId: string;
    content: string;
    contentType?: string;
    metadata?: Record<string, unknown> | null;
    clientId?: string;
    replyToId?: string;
    attachments?: (MessageAttachmentEntity | MessageAttachmentInput)[];
  }): Promise<Result<MessageEntity, AppError>> {
    try {
      const result = await this.messageRepository.send(params);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to send message", "MESSAGE_SEND_FAILED", { originalError: error })
      );
    }
  }
}
