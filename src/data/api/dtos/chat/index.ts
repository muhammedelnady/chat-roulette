/** @format */

export interface ConversationDto {
  id: string;
  scope: string;
  handledBy: string;
  status?: string;
  orderId?: string | null;
  subject?: string | null;
  guestSessionId?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  participants?: ParticipantDto[];
  messages?: MessageDto[];
  category?: "TRENDING" | "TECH" | "DESIGN" | "FOUNDERS" | "ROULETTE";
  topic?: string | null;
  participantCount?: number;
  unreadCount?: number;
  isRouletteMatch?: boolean;
  icebreaker?: string | null;
  partnerRole?: string | null;
  partnerLocation?: string | null;
}

export interface ParticipantDto {
  id: string;
  userId: string;
  role: string;
  user?: { id: string; fullName: string; image?: string | null } | null;
}

export interface MessageDto {
  id: string;
  clientId: string;
  conversationId: string;
  senderId?: string | null;
  senderType: string;
  senderName?: string | null;
  content?: string | null;
  contentType: string;
  metadata?: Record<string, unknown> | null;
  replyToId?: string | null;
  isEdited: boolean;
  deletedAt?: string | null;
  createdAt: string;
  status?: string;
  readReceipts?: { userId: string; readAt: string }[];
  attachments?: AttachmentDto[];
  reactions?: Record<string, string[]>;
}

export interface AttachmentDto {
  id?: string;
  uploadId?: string;
  url?: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  cloudinaryId?: string | null;
  deletedAt?: string | null;
}

export interface MessagesListResponse {
  data: MessageDto[];
  nextCursor: string | null;
}
