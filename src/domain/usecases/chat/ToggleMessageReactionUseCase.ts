/** @format */

import type { MessageEntity } from "@/src/domain/entities";
import { type AppError, ValidationError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, type Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class ToggleMessageReactionUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<Result<MessageEntity | null, AppError>> {
    if (!conversationId.trim()) {
      return err(new ValidationError("Conversation ID is required", "conversationId"));
    }
    if (!messageId.trim()) {
      return err(new ValidationError("Message ID is required", "messageId"));
    }
    if (!emoji.trim()) {
      return err(new ValidationError("Reaction emoji is required", "emoji"));
    }
    return safeExecute(
      () => this.messageRepository.toggleReaction(conversationId, messageId, emoji),
      "Failed to toggle message reaction",
      "MESSAGE_REACTION_FAILED"
    );
  }
}
