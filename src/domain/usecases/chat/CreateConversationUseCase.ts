/** @format */

import type { ConversationEntity } from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class CreateConversationUseCase {
  constructor(private conversationRepository: IConversationRepository) {}

  async execute(params: {
    scope?: string;
    subject?: string;
    topic?: string;
    category?: string;
  }): Promise<Result<ConversationEntity, AppError>> {
    try {
      const result = await this.conversationRepository.create(params);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to create conversation", "CONVERSATION_CREATE_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
