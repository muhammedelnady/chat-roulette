/** @format */

import type { ConversationEntity } from "@/src/domain/entities";
import type { AppError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import type { Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class CreateConversationUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(params: {
    scope?: string;
    subject?: string;
    topic?: string;
    category?: string;
  }): Promise<Result<ConversationEntity, AppError>> {
    return safeExecute(
      () => this.conversationRepository.create(params),
      "Failed to create conversation",
      "CONVERSATION_CREATE_FAILED"
    );
  }
}
