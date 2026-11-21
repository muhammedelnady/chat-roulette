/** @format */

import type { MessageEntity } from "@/src/domain/entities";
import { type AppError, ValidationError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, type Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class GetMessagesUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: MessageEntity[]; nextCursor: string | null }, AppError>> {
    if (!conversationId.trim()) {
      return err(new ValidationError("Conversation ID is required", "conversationId"));
    }
    if (limit !== undefined && (!Number.isFinite(limit) || limit <= 0)) {
      return err(new ValidationError("Limit must be a positive number", "limit"));
    }
    return safeExecute(
      () => this.messageRepository.list(conversationId, cursor, limit),
      "Failed to fetch messages",
      "MESSAGES_FETCH_FAILED"
    );
  }
}
