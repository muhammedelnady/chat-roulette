/** @format */

import type { ConversationEntity } from "@/src/domain/entities";
import { type AppError, ValidationError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import { err, type Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class GetConversationByIdUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(conversationId: string): Promise<Result<ConversationEntity | null, AppError>> {
    if (!conversationId.trim()) {
      return err(new ValidationError("Conversation ID is required", "conversationId"));
    }
    return safeExecute(
      () => this.conversationRepository.getById(conversationId),
      "Failed to fetch conversation",
      "CONVERSATION_FETCH_FAILED"
    );
  }
}
