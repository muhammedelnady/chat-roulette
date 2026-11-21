/** @format */
/**
 * Domain IConversation Repository
 */

import type { ConversationEntity } from "@/src/domain/entities";
import type { AppError } from "@/src/domain/errors";
import type { Result } from "@/src/domain/Result";

export interface IConversationRepository {
  list(
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: ConversationEntity[]; nextCursor: string | null }, AppError>>;
  getById(conversationId: string): Promise<Result<ConversationEntity | null, AppError>>;
  create(params: {
    scope?: string;
    subject?: string;
    topic?: string;
    category?: string;
  }): Promise<Result<ConversationEntity, AppError>>;
  matchRoulette(topic?: string): Promise<Result<ConversationEntity, AppError>>;
  close(conversationId: string): Promise<Result<ConversationEntity, AppError>>;
}
