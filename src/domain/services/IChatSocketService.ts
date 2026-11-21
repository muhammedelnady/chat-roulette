/** @format */
/**
 * Domain IChat Socket Service
 */

export interface ChatSocketLogger {
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export interface StaffMemberInfo {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface SupportPresencePayload {
  onlineCount: number;
  onlineAgentCount?: number;
  isSupportOnline?: boolean;
  agents: StaffMemberInfo[];
}

export interface QueueStatusPayload {
  conversationId: string;
  status?: "WAITING" | "ASSIGNED" | "QUEUED_OFFLINE";
  queuePosition: number;
  aheadCount?: number;
  estimatedWaitMinutes: number;
  assignedStaff?: {
    id: string;
    name: string;
    role: string;
  };
  isAgentAssigned?: boolean;
  assignedAgentName?: string;
}

export interface IChatSocketService {
  connect(token?: string, guestSessionId?: string): void | Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  getPendingQueueCount?(): number;
  joinConversation(conversationId: string): void;
  leaveConversation(conversationId: string): void;
  sendMessage(data: {
    conversationId: string;
    clientId: string;
    content?: string;
    contentType?: string;
    metadata?: Record<string, unknown> | null;
    replyToId?: string;
    attachments?: {
      uploadId?: string;
      url: string;
      mimeType: string;
      fileName: string;
      fileSize: number;
      width?: number;
      height?: number;
      cloudinaryId?: string;
    }[];
  }): void;
  startTyping(conversationId: string): void;
  stopTyping(conversationId: string): void;
  markMessageRead(conversationId: string, messageId: string): void;
  deleteAttachment(data: {
    attachmentId: string;
    conversationId: string;
    messageId?: string;
  }): void;
  onEvent(event: string, handler: (...args: unknown[]) => void): void;
  offEvent(event: string, handler?: (...args: unknown[]) => void): void;
}
