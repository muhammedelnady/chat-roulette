/** @format */
/**
 * Data Chat Mapper
 */

import { z } from "zod/v4";

import type { ConversationDto, MessageDto } from "@/src/data/api/dtos/chat";
import { roomCategorySchema } from "@/src/data/api/dtos/chat/schemas";
import { zChatScope } from "@/src/data/types/enums";
import type { ConversationEntity, MessageEntity } from "@/src/domain/entities";

const conversationHandledBySchema = z.enum(["BOT", "SUPPORT_AGENT", "COMMUNITY", "PEER"]);
const conversationStatusSchema = z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED"]);
const messageSenderTypeSchema = z.enum(["USER", "SYSTEM", "SUPPORT_AGENT", "BOT"]);
const messageStatusSchema = z.enum(["PENDING", "SENT", "DELIVERED", "READ", "FAILED"]);

function mapChatScope(raw: unknown): ConversationEntity["scope"] {
  const result = zChatScope.safeParse(raw);
  return result.success ? result.data : "ROOM";
}

function mapConversationHandledBy(raw: unknown): ConversationEntity["handledBy"] {
  const result = conversationHandledBySchema.safeParse(raw);
  return result.success ? result.data : "COMMUNITY";
}

function mapConversationStatus(raw: unknown): ConversationEntity["status"] {
  const result = conversationStatusSchema.safeParse(raw);
  return result.success ? result.data : "OPEN";
}

function mapRoomCategory(raw: unknown): ConversationEntity["category"] {
  const result = roomCategorySchema.safeParse(raw);
  return result.success ? result.data : undefined;
}

function mapMessageSenderType(raw: unknown): MessageEntity["senderType"] {
  const result = messageSenderTypeSchema.safeParse(raw);
  return result.success ? result.data : "USER";
}

function mapMessageStatus(raw: unknown): MessageEntity["status"] {
  const result = messageStatusSchema.safeParse(raw);
  return result.success ? result.data : "DELIVERED";
}

function pickLatestMessage(messages?: readonly MessageDto[]): MessageEntity | undefined {
  if (!messages || messages.length === 0) return undefined;
  let latest = messages[0];
  let latestTs = latest ? Date.parse(latest.createdAt) || 0 : -Infinity;
  for (let i = 1; i < messages.length; i += 1) {
    const candidate = messages[i];
    if (!candidate) continue;
    const candidateTs = Date.parse(candidate.createdAt) || 0;
    if (candidateTs >= latestTs) {
      latest = candidate;
      latestTs = candidateTs;
    }
  }
  return latest ? mapMessageDtoToEntity(latest) : undefined;
}

export function mapConversationDtoToEntity(dto: ConversationDto): ConversationEntity {
  return {
    id: dto.id,
    scope: mapChatScope(dto.scope),
    handledBy: mapConversationHandledBy(dto.handledBy),
    orderId: dto.orderId,
    subject: dto.subject,
    guestSessionId: dto.guestSessionId,
    status: mapConversationStatus(dto.status),
    closedAt: dto.closedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    participants: (dto.participants ?? []).map((p) => ({
      id: p.id,
      userId: p.userId,
      role: p.role,
      user: p.user ?? undefined,
    })),
    lastMessage: pickLatestMessage(dto.messages),
    category: mapRoomCategory(dto.category),
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
    clientId: dto.clientId || dto.id,
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
    status: mapMessageStatus(dto.status),
    readReceipts: dto.readReceipts,
    reactions: dto.reactions,
    attachments: (dto.attachments ?? [])
      .map((a) => ({
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
      }))
      .filter((a) => a.id.length > 0 && a.url.length > 0),
  };
}
