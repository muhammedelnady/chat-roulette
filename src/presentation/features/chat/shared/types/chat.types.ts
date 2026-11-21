/** @format */

import type {
  ConversationEntity,
  ConversationParticipantEntity,
  ConversationStatus,
  MessageAttachmentEntity,
  MessageEntity,
  MessageStatus,
  RoomCategory,
  SenderType,
} from "@/src/domain/entities/Chat";

export type ChatMessageEntity = MessageEntity;
export type ChatAttachmentEntity = MessageAttachmentEntity;
export type ChatConversationEntity = ConversationEntity;
export type ChatParticipantEntity = ConversationParticipantEntity;
export type ChatSenderType = SenderType;
export type ChatMessageStatus = MessageStatus;
export type ChatConversationStatus = ConversationStatus;
export type ChatRoomCategory = RoomCategory;

export interface StagedAttachment {
  readonly localId?: string;
  readonly uri: string;
  readonly name: string;
  readonly type: string;
  readonly size: number;
  readonly isUploading?: boolean;
  readonly uploadedAttachment?: ChatAttachmentEntity;
}
