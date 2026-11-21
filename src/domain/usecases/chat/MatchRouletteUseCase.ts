/** @format */

import type { ConversationEntity } from "@/src/domain/entities";
import type { AppError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import type { Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class MatchRouletteUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(topic?: string): Promise<Result<ConversationEntity, AppError>> {
    return safeExecute(
      () => this.conversationRepository.matchRoulette(topic),
      "Failed to match chat roulette partner",
      "ROULETTE_MATCH_FAILED"
    );
  }
}
