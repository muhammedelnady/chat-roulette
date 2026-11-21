/** @format */

import type { ConversationEntity } from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class GetConversationsUseCase {
  constructor(private conversationRepository: IConversationRepository) {}

  async execute(
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: ConversationEntity[]; nextCursor: string | null }, AppError>> {
    try {
      const result = await this.conversationRepository.list(cursor, limit);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to fetch conversations", "CONVERSATIONS_FETCH_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
