/** @format */
/**
 * Data Chat Mapper
 */

import { z } from "zod/v4";

import type { ConversationDto, MessageDto } from "@/src/data/api/dtos/chat";
import { zChatScope } from "@/src/data/types/enums";
import type { ConversationEntity, MessageEntity } from "@/src/domain/entities";

const conversationHandledBySchema = z.enum(["BOT", "SUPPORT_AGENT", "COMMUNITY", "PEER"]);
const messageSenderTypeSchema = z.enum(["USER", "SYSTEM", "SUPPORT_AGENT", "BOT"]);

function mapChatScope(raw: unknown): ConversationEntity["scope"] {
  const result = zChatScope.safeParse(raw);
  return result.success ? result.data : "ROOM";
}

function mapConversationHandledBy(raw: unknown): ConversationEntity["handledBy"] {
  const result = conversationHandledBySchema.safeParse(raw);
  return result.success ? result.data : "COMMUNITY";
}

function mapMessageSenderType(raw: unknown): MessageEntity["senderType"] {
  const result = messageSenderTypeSchema.safeParse(raw);
  return result.success ? result.data : "USER";
}

export function mapConversationDtoToEntity(dto: ConversationDto): ConversationEntity {
  return {
    id: dto.id,
    scope: mapChatScope(dto.scope),
    handledBy: mapConversationHandledBy(dto.handledBy),
    orderId: dto.orderId,
    subject: dto.subject,
    guestSessionId: dto.guestSessionId,
    status: dto.status as ConversationEntity["status"],
    closedAt: dto.closedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    participants: (dto.participants ?? []).map((p) => ({
      id: p.id,
      userId: p.userId,
      role: p.role,
      user: p.user ?? undefined,
    })),
    lastMessage:
      dto.messages && dto.messages.length > 0 && dto.messages[0]
        ? mapMessageDtoToEntity(dto.messages[0])
        : undefined,
    category: dto.category,
    topic: dto.topic,
    participantCount: dto.participantCount,
    unreadCount: dto.unreadCount,
    isRouletteMatch: dto.isRouletteMatch,
    icebreaker: dto.icebreaker,
    partnerRole: dto.partnerRole,
    partnerLocation: dto.partnerLocation,
  };
}

export function mapMessageDtoToEntity(dto: MessageDto): MessageEntity {
  return {
    id: dto.id,
    clientId: dto.clientId,
    conversationId: dto.conversationId,
    senderId: dto.senderId,
    senderType: mapMessageSenderType(dto.senderType),
    senderName: dto.senderName,
    content: dto.content,
    contentType: dto.contentType,
    metadata: dto.metadata,
    replyToId: dto.replyToId,
    isEdited: dto.isEdited,
    deletedAt: dto.deletedAt,
    createdAt: dto.createdAt,
    status: dto.status as MessageEntity["status"],
    readReceipts: dto.readReceipts,
    reactions: dto.reactions,
    attachments: (dto.attachments ?? []).map((a) => ({
      id: a.id ?? a.uploadId ?? "",
      uploadId: a.uploadId,
      url: a.url ?? "",
      mimeType: a.mimeType,
      fileName: a.fileName,
      fileSize: a.fileSize,
      width: a.width,
      height: a.height,
      cloudinaryId: a.cloudinaryId,
      deletedAt: a.deletedAt,
    })),
  };
}
