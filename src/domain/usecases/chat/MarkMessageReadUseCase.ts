/** @format */

import { type AppError, ValidationError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, type Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class MarkMessageReadUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(conversationId: string, messageId: string): Promise<Result<void, AppError>> {
    if (!conversationId.trim()) {
      return err(new ValidationError("Conversation ID is required", "conversationId"));
    }
    if (!messageId.trim()) {
      return err(new ValidationError("Message ID is required", "messageId"));
    }
    return safeExecute(
      () => this.messageRepository.markRead(conversationId, messageId),
      "Failed to mark message read",
      "MESSAGE_READ_FAILED"
    );
  }
}
