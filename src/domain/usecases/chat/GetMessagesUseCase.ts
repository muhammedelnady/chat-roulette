/** @format */

import type { MessageEntity } from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class GetMessagesUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: MessageEntity[]; nextCursor: string | null }, AppError>> {
    try {
      const result = await this.messageRepository.list(conversationId, cursor, limit);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to fetch messages", "MESSAGES_FETCH_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
