/** @format */

import { AppError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class MarkMessageReadUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(conversationId: string, messageId: string): Promise<Result<void, AppError>> {
    try {
      const result = await this.messageRepository.markRead(conversationId, messageId);
      if (isErr(result)) return err(result.error);
      return ok(undefined);
    } catch (error) {
      return err(
        new AppError("Failed to mark message read", "MESSAGE_READ_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
