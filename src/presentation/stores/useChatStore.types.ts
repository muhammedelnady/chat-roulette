/** @format */

import type {
  ConversationEntity,
  ConversationStatus,
  MessageEntity,
  MessageStatus,
} from "@/src/domain/entities";
import type { QueueStatusPayload, SupportPresencePayload } from "@/src/domain/services";

export interface ChatState {
  conversations: Record<string, ConversationEntity>;
  currentConversationId: string | null;
  messages: Record<string, MessageEntity[]>;
  nextCursors: Record<string, string | null>;
  typingUsers: Record<string, string[]>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  supportPresence: SupportPresencePayload | null;
  queueStatuses: Record<string, QueueStatusPayload>;
  outboundQueueCount: number;

  setConversations: (conversations: ConversationEntity[]) => void;
  appendConversations: (conversations: ConversationEntity[]) => void;
  upsertConversation: (conversation: ConversationEntity) => void;
  setCurrentConversationId: (id: string | null) => void;
  setMessages: (
    conversationId: string,
    messages: MessageEntity[],
    nextCursor: string | null
  ) => void;
  appendMessages: (
    conversationId: string,
    messages: MessageEntity[],
    nextCursor: string | null
  ) => void;
  prependMessage: (conversationId: string, message: MessageEntity) => void;
  upsertMessage: (conversationId: string, message: MessageEntity) => void;
  updateMessageStatus: (
    conversationId: string,
    clientIdOrId: string,
    status: MessageStatus
  ) => void;
  markMessagesRead: (
    conversationId: string,
    messageId: string,
    userId: string,
    readAt: string
  ) => void;
  toggleMessageReaction: (conversationId: string, messageId: string, emoji: string) => void;
  removeAttachment: (conversationId: string, messageId: string, attachmentId: string) => void;
  updateConversationStatus: (conversationId: string, status: ConversationStatus) => void;
  setTypingUsers: (conversationId: string, userIds: string[]) => void;
  setIsLoadingConversations: (v: boolean) => void;
  setIsLoadingMessages: (v: boolean) => void;
  setError: (error: string | null) => void;
  setSupportPresence: (presence: SupportPresencePayload) => void;
  setQueueStatus: (conversationId: string, status: QueueStatusPayload) => void;
  setOutboundQueueCount: (count: number) => void;
  reset: () => void;
}
