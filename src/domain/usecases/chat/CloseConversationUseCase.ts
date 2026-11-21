/** @format */

import type { ConversationEntity } from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class CloseConversationUseCase {
  constructor(private conversationRepository: IConversationRepository) {}

  async execute(conversationId: string): Promise<Result<ConversationEntity, AppError>> {
    try {
      const result = await this.conversationRepository.close(conversationId);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to close conversation", "CONVERSATION_CLOSE_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
