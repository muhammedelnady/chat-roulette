/** @format */
/**
 * Data Chat Repository Implementation (REST Adapter)
 */

import { http } from "@/src/data/api";
import type { ConversationDto } from "@/src/data/api/dtos/chat";
import type { ApiResponse } from "@/src/data/api/dtos/common";
import {
  CONVERSATIONS_API,
  CONVERSATION_BY_ID_API,
  CONVERSATION_CLOSE_API,
  ROULETTE_MATCH_API,
} from "@/src/data/api/endpoints";
import { extractEnvelopeEntity } from "@/src/data/api/envelope";
import { mapConversationDtoToEntity } from "@/src/data/mappers/ChatMapper";
import { log } from "@/src/data/utils/logger";
import type { ConversationEntity } from "@/src/domain/entities";
import { ServerError, type AppError } from "@/src/domain/errors";
import type { IConversationRepository } from "@/src/domain/repositories";
import { err, ok, type Result } from "@/src/domain/Result";

import { BaseRepository } from "./BaseRepository";

interface ConversationListResponse {
  data: ConversationDto[];
  nextCursor: string | null;
}

function extractConversationDto(res: {
  data?: ApiResponse<ConversationDto> | ConversationDto | null;
}): ConversationDto | null {
  if (!res.data) return null;
  return extractEnvelopeEntity<ConversationDto>(res.data, ["conversation", "data"]);
}

export class ChatRepositoryImpl extends BaseRepository implements IConversationRepository {
  async list(
    cursor?: string,
    limit?: number
  ): Promise<Result<{ data: ConversationEntity[]; nextCursor: string | null }, AppError>> {
    try {
      const params: Record<string, string> = {};
      if (cursor) params["cursor"] = cursor;
      if (limit) params["limit"] = String(limit);
      const response = await http.get<ApiResponse<ConversationListResponse>>(CONVERSATIONS_API, {
        params,
      });
      const data = response.data;
      if (!data.data.length) return ok({ data: [], nextCursor: data.nextCursor });
      return ok({
        data: data.data.map(mapConversationDtoToEntity),
        nextCursor: data.nextCursor,
      });
    } catch (error) {
      log.error("Failed to fetch conversations:", error);
      return err(this.handleError(error, "getConversations", "CONVERSATIONS_FETCH_FAILED"));
    }
  }

  async getById(conversationId: string): Promise<Result<ConversationEntity | null, AppError>> {
    try {
      const url = CONVERSATION_BY_ID_API.replace(":id", conversationId);
      const response = await http.get<ApiResponse<ConversationDto>>(url);
      const data = extractConversationDto(response);
      if (!data) return ok(null);
      return ok(mapConversationDtoToEntity(data));
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
      return ok(mapConversationDtoToEntity(data));
    } catch (error) {
      log.error("Failed to match roulette partner:", error);
      return err(this.handleError(error, "matchRoulette", "ROULETTE_MATCH_FAILED"));
    }
  }

  async close(conversationId: string): Promise<Result<ConversationEntity, AppError>> {
    try {
      const url = CONVERSATION_CLOSE_API.replace(":id", conversationId);
      const response = await http.post<ApiResponse<ConversationDto>>(url);
      const data = extractConversationDto(response);
      if (!data) return err(new ServerError("Invalid close conversation response"));
      return ok(mapConversationDtoToEntity(data));
    } catch (error) {
      log.error(`Failed to close conversation ${conversationId}:`, error);
      return err(this.handleError(error, "closeConversation", "CONVERSATION_CLOSE_FAILED"));
    }
  }
}
