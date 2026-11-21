/** @format */
/**
 * Data Chat Repository Implementation (REST Adapter)
 */

import { http } from "@/src/data/api";
import type { ConversationDto } from "@/src/data/api/dtos/chat";
import {
  conversationDtoSchema,
  conversationListResponseSchema,
} from "@/src/data/api/dtos/chat/schemas";
import type { ApiResponse } from "@/src/data/api/dtos/common";
import {
  CONVERSATIONS_API,
  CONVERSATION_BY_ID_API,
  CONVERSATION_CLOSE_API,
  ROULETTE_MATCH_API,
  buildApiUrl,
} from "@/src/data/api/endpoints";
import { extractEnvelopeEntity } from "@/src/data/api/envelope";
import { mapConversationDtoToEntity } from "@/src/data/mappers/ChatMapper";
import type { ConversationEntity } from "@/src/domain/entities";
import { NetworkError, SerializationError, ServerError, type AppError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import { err, ok, type Result } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";

import { BaseRepository } from "./BaseRepository";

const CACHE_TTL_MS = 60_000;

interface ConversationListResponse {
  data: ConversationDto[];
  nextCursor: string | null;
}

function extractConversationDto(raw: unknown): ConversationDto | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as { data?: unknown };
  const target = record.data ?? raw;
  const extracted = extractEnvelopeEntity<Record<string, unknown>>(target, [
    "conversation",
    "data",
  ]);
  if (!extracted) return null;
  const parsed = conversationDtoSchema.safeParse(extracted);
  return parsed.success ? parsed.data : null;
}

export class ChatRepositoryImpl extends BaseRepository implements IConversationRepository {
  async list(
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: ConversationEntity[]; nextCursor: string | null }, AppError>> {
    const cacheKey = `chat:conversations:${cursor ?? "first"}:${limit ?? "default"}`;

    if (!this.isOnline()) {
      const stale = this.cacheManager.getStaleFallback<{
        data: ConversationEntity[];
        nextCursor: string | null;
      }>(cacheKey);
      if (stale) return ok(stale);
      return err(new NetworkError("Cannot fetch conversations while offline"));
    }

    try {
      const params: Record<string, string> = {};
      if (cursor) params["cursor"] = cursor;
      if (limit) params["limit"] = String(limit);
      const response = await http.get<ApiResponse<ConversationListResponse>>(CONVERSATIONS_API, {
        params,
      });
      const parsed = conversationListResponseSchema.safeParse(response.data);
      if (!parsed.success) {
        return err(
          new SerializationError("Invalid conversations list response", {
            issues: parsed.error.issues,
          })
        );
      }
      const resultValue = {
        data: parsed.data.data.map(mapConversationDtoToEntity),
        nextCursor: parsed.data.nextCursor,
      };
      this.cacheManager.set(cacheKey, resultValue, CACHE_TTL_MS);
      return ok(resultValue);
    } catch (error) {
      log.error("Failed to fetch conversations:", error);
      return err(this.handleError(error, "getConversations", "CONVERSATIONS_FETCH_FAILED"));
    }
  }

  async getById(conversationId: string): Promise<Result<ConversationEntity | null, AppError>> {
    const cacheKey = `chat:conversation:${conversationId}`;

    if (!this.isOnline()) {
      const cached = this.cacheManager.getStaleFallback<ConversationEntity>(cacheKey);
      if (cached) return ok(cached);
      return err(new NetworkError("Cannot fetch conversation while offline"));
    }

    try {
      const url = buildApiUrl(CONVERSATION_BY_ID_API, { id: conversationId });
      const response = await http.get<ApiResponse<ConversationDto>>(url);
      const data = extractConversationDto(response);
      if (!data) return ok(null);
      const entity = mapConversationDtoToEntity(data);
      this.cacheManager.set(cacheKey, entity, CACHE_TTL_MS);
      return ok(entity);
    } catch (error) {
      log.error(`Failed to fetch conversation ${conversationId}:`, error);
      return err(this.handleError(error, "getConversationById", "CONVERSATION_FETCH_FAILED"));
    }
  }

  async create(params: {
    scope?: string;
    subject?: string;
    topic?: string;
    category?: string;
  }): Promise<Result<ConversationEntity, AppError>> {
    try {
      const response = await http.post<ApiResponse<ConversationDto>>(CONVERSATIONS_API, params);
      const data = extractConversationDto(response);
      if (!data) return err(new ServerError("Invalid create conversation response"));
      this.cacheManager.invalidatePrefix("chat:conversations:");
      return ok(mapConversationDtoToEntity(data));
    } catch (error) {
      log.error("Failed to create conversation:", error);
      return err(this.handleError(error, "createConversation", "CONVERSATION_CREATE_FAILED"));
    }
  }

  async matchRoulette(topic?: string): Promise<Result<ConversationEntity, AppError>> {
    try {
      const response = await http.post<ApiResponse<ConversationDto>>(ROULETTE_MATCH_API, {
        topic,
      });
      const data = extractConversationDto(response);
      if (!data) return err(new ServerError("Invalid roulette match response"));
      this.cacheManager.invalidatePrefix("chat:conversations:");
      return ok(mapConversationDtoToEntity(data));
    } catch (error) {
      log.error("Failed to match roulette partner:", error);
      return err(this.handleError(error, "matchRoulette", "ROULETTE_MATCH_FAILED"));
    }
  }

  async close(conversationId: string): Promise<Result<ConversationEntity, AppError>> {
    try {
      const url = buildApiUrl(CONVERSATION_CLOSE_API, { id: conversationId });
      const response = await http.post<ApiResponse<ConversationDto>>(url);
      const data = extractConversationDto(response);
      if (!data) return err(new ServerError("Invalid close conversation response"));
      this.cacheManager.invalidatePrefix("chat:conversations:");
      this.cacheManager.delete(`chat:conversation:${conversationId}`);
      return ok(mapConversationDtoToEntity(data));
    } catch (error) {
      log.error(`Failed to close conversation ${conversationId}:`, error);
      return err(this.handleError(error, "closeConversation", "CONVERSATION_CLOSE_FAILED"));
    }
  }
}
