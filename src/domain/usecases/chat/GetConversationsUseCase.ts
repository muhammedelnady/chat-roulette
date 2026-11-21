/** @format */

import type { ConversationEntity } from "@/src/domain/entities";
import { type AppError, ValidationError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import { err, type Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class GetConversationsUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: ConversationEntity[]; nextCursor: string | null }, AppError>> {
    if (limit !== undefined && (!Number.isFinite(limit) || limit <= 0)) {
      return err(new ValidationError("Limit must be a positive number", "limit"));
    }
    return safeExecute(
      () => this.conversationRepository.list(cursor, limit),
      "Failed to fetch conversations",
      "CONVERSATIONS_FETCH_FAILED"
    );
  }
}
