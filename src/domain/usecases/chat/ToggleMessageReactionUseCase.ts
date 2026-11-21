/** @format */

import type { MessageEntity } from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class ToggleMessageReactionUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<Result<MessageEntity | null, AppError>> {
    try {
      const result = await this.messageRepository.toggleReaction(conversationId, messageId, emoji);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to toggle message reaction", "MESSAGE_REACTION_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
