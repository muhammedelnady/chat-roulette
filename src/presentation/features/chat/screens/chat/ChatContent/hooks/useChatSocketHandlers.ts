/** @format */

import type {
  IChatSocketService,
  QueueStatusPayload,
  SupportPresencePayload,
} from "@/src/domain/services";
import type { ChatState } from "@/src/presentation/stores/useChatStore.types";

import type { ChatMessageEntity } from "../../../../shared/types";

type StoreActions = Pick<
  ChatState,
  | "upsertMessage"
  | "updateMessageStatus"
  | "setTypingUsers"
  | "markMessagesRead"
  | "removeAttachment"
  | "setQueueStatus"
  | "setOutboundQueueCount"
  | "setSupportPresence"
>;

export function bindChatSocketEvents(
  conversationId: string,
  socket: IChatSocketService,
  actions: StoreActions,
  onReconnect: () => void
): () => void {
  const handleNewMessage = (payload: unknown) => {
    const data = payload as
      { message?: ChatMessageEntity; conversationId?: string } | ChatMessageEntity;
    const msg = "message" in data && data.message ? data.message : (data as ChatMessageEntity);
    const convId =
      "conversationId" in data && data.conversationId ? data.conversationId : msg.conversationId;
    if (convId === conversationId && msg.id) {
      actions.upsertMessage(conversationId, msg);
      if (msg.senderType !== "USER") {
        socket.markMessageRead(conversationId, msg.id);
      }
    }
  };

  const handleMessageDelivered = (payload: unknown) => {
    const data = payload as { clientId?: string };
    if (data.clientId) {
      actions.updateMessageStatus(conversationId, data.clientId, "DELIVERED");
    }
  };

  const handleTypingUpdate = (payload: unknown) => {
    const data = payload as { conversationId?: string; userIds?: string[] };
    if (data.conversationId === conversationId && Array.isArray(data.userIds)) {
      actions.setTypingUsers(conversationId, data.userIds);
    }
  };

  const handleMessageRead = (payload: unknown) => {
    const data = payload as {
      conversationId?: string;
      messageId?: string;
      userId?: string;
      readByUserId?: string;
      readAt?: string;
    };
    const readUserId = data.readByUserId ?? data.userId;
    if (data.conversationId === conversationId && data.messageId && readUserId) {
      actions.markMessagesRead(
        conversationId,
        data.messageId,
        readUserId,
        data.readAt ?? new Date().toISOString()
      );
    }
  };

  const handleAttachmentDeleted = (payload: unknown) => {
    const data = payload as {
      conversationId?: string;
      messageId?: string;
      attachmentId?: string;
    };
    if (data.conversationId === conversationId && data.messageId && data.attachmentId) {
      actions.removeAttachment(conversationId, data.messageId, data.attachmentId);
    }
  };

  const handleQueueStatus = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return;
    const data = payload as QueueStatusPayload;
    if (data.conversationId === conversationId) {
      actions.setQueueStatus(conversationId, data);
    }
  };

  const handleQueueUpdated = (payload: unknown) => {
    const data = payload as { count?: number };
    if (typeof data.count === "number") {
      actions.setOutboundQueueCount(data.count);
    }
  };

  const handleSupportPresence = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return;
    const data = payload as Record<string, unknown>;
    const rawCount = Number(data["onlineCount"] ?? data["onlineAgentCount"] ?? 0);
    actions.setSupportPresence({
      onlineCount: rawCount,
      onlineAgentCount: rawCount,
      isSupportOnline: Boolean(data["isSupportOnline"] ?? rawCount > 0),
      agents: Array.isArray(data["agents"])
        ? (data["agents"] as SupportPresencePayload["agents"])
        : [],
    });
  };

  socket.onEvent("message:new", handleNewMessage);
  socket.onEvent("message:delivered", handleMessageDelivered);
  socket.onEvent("typing:update", handleTypingUpdate);
  socket.onEvent("message:read", handleMessageRead);
  socket.onEvent("attachment:deleted", handleAttachmentDeleted);
  socket.onEvent("conversation:queue_status", handleQueueStatus);
  socket.onEvent("queue:updated", handleQueueUpdated);
  socket.onEvent("support:presence", handleSupportPresence);
  socket.onEvent("reconnect", onReconnect);

  return () => {
    socket.offEvent("message:new", handleNewMessage);
    socket.offEvent("message:delivered", handleMessageDelivered);
    socket.offEvent("typing:update", handleTypingUpdate);
    socket.offEvent("message:read", handleMessageRead);
    socket.offEvent("attachment:deleted", handleAttachmentDeleted);
    socket.offEvent("conversation:queue_status", handleQueueStatus);
    socket.offEvent("queue:updated", handleQueueUpdated);
    socket.offEvent("support:presence", handleSupportPresence);
    socket.offEvent("reconnect", onReconnect);
  };
}
