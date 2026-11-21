/** @format */
/**
 * Domain Chat Entities
 */

export type ConversationScope = "BOT" | "SUPPORT" | "ROOM" | "ROULETTE";
export type ConversationHandledBy = "BOT" | "SUPPORT_AGENT" | "COMMUNITY" | "PEER";
export type ConversationStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
export type SenderType = "USER" | "SYSTEM" | "SUPPORT_AGENT" | "BOT";
export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";

export type RoomCategory = "ALL" | "TRENDING" | "TECH" | "DESIGN" | "FOUNDERS" | "ROULETTE";

export interface ConversationParticipantEntity {
  id: string;
  userId: string;
  role: string;
  user?: { id: string; fullName: string; image?: string | null };
}

export interface ConversationEntity {
  id: string;
  scope: ConversationScope;
  handledBy: ConversationHandledBy;
  status?: ConversationStatus;
  orderId?: string | null;
  subject?: string | null;
  guestSessionId?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipantEntity[];
  lastMessage?: MessageEntity | null;
  order?: { id: string; orderNumber: string; total: string; status: string } | null;
  category?: Exclude<RoomCategory, "ALL">;
  topic?: string | null;
  participantCount?: number;
  unreadCount?: number;
  isRouletteMatch?: boolean;
  icebreaker?: string | null;
  partnerRole?: string | null;
  partnerLocation?: string | null;
}

export interface MessageAttachmentEntity {
  id: string;
  uploadId?: string;
  url: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  cloudinaryId?: string | null;
  deletedAt?: string | null;
}

export interface MessageAttachmentInput {
  id?: string;
  uploadId?: string;
  url: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  cloudinaryId?: string | null;
}

export interface MessageEntity {
  id: string;
  clientId: string;
  conversationId: string;
  senderId?: string | null;
  senderType: SenderType;
  senderName?: string | null;
  content?: string | null;
  contentType: string;
  status?: MessageStatus;
  metadata?: Record<string, unknown> | null;
  replyToId?: string | null;
  isEdited: boolean;
  deletedAt?: string | null;
  createdAt: string;
  attachments: MessageAttachmentEntity[];
  readReceipts?: { userId: string; readAt: string }[];
  reactions?: Record<string, string[]>;
}
