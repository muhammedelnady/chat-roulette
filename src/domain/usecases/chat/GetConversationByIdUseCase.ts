/** @format */

import type { ConversationEntity } from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class GetConversationByIdUseCase {
  constructor(private conversationRepository: IConversationRepository) {}

  async execute(conversationId: string): Promise<Result<ConversationEntity | null, AppError>> {
    try {
      const result = await this.conversationRepository.getById(conversationId);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to fetch conversation", "CONVERSATION_FETCH_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
