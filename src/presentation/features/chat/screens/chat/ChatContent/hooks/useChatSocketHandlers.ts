/** @format */

import { AppState } from "react-native";

import type {
  IChatSocketService,
  QueueStatusPayload,
  SupportPresencePayload,
} from "@/src/domain/services";
import type { ChatState } from "@/src/presentation/stores/useChatStore.types";

import { isRecord, parseIncomingMessage } from "../../../../shared/utils/messageParser";

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

const TYPING_EXPIRY_MS = 6000;

export function bindChatSocketEvents(
  conversationId: string,
  socket: IChatSocketService,
  actions: StoreActions,
  onReconnect: () => void
): () => void {
  let typingExpiryTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTypingExpiry = () => {
    if (typingExpiryTimer) {
      clearTimeout(typingExpiryTimer);
      typingExpiryTimer = null;
    }
  };

  const handleNewMessage = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const rawMsg = isRecord(payload["message"]) ? payload["message"] : payload;
    const convId =
      typeof payload["conversationId"] === "string"
        ? payload["conversationId"]
        : typeof rawMsg["conversationId"] === "string"
          ? rawMsg["conversationId"]
          : undefined;
    if (convId !== conversationId) return;

    const msg = parseIncomingMessage({ ...rawMsg, conversationId: convId });
    if (!msg) return;

    actions.upsertMessage(conversationId, msg);
    if (msg.senderType !== "USER" && AppState.currentState === "active") {
      socket.markMessageRead(conversationId, msg.id);
    }
  };

  const handleMessageDelivered = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const convId = payload["conversationId"];
    if (typeof convId === "string" && convId !== conversationId) return;
    const clientId = payload["clientId"];
    if (typeof clientId === "string" && clientId.length > 0) {
      actions.updateMessageStatus(conversationId, clientId, "DELIVERED");
    }
  };

  const handleMessageFailed = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const convId = payload["conversationId"];
    if (typeof convId === "string" && convId !== conversationId) return;
    const clientId = payload["clientId"];
    if (typeof clientId === "string" && clientId.length > 0) {
      actions.updateMessageStatus(conversationId, clientId, "FAILED");
    }
  };

  const handleTypingUpdate = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const convId = payload["conversationId"];
    const userIds = payload["userIds"];
    if (convId === conversationId && Array.isArray(userIds)) {
      const validIds = userIds.filter((id): id is string => typeof id === "string");
      actions.setTypingUsers(conversationId, validIds);
      clearTypingExpiry();
      if (validIds.length > 0) {
        typingExpiryTimer = setTimeout(() => {
          actions.setTypingUsers(conversationId, []);
        }, TYPING_EXPIRY_MS);
      }
    }
  };

  const handleMessageRead = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const convId = payload["conversationId"];
    const messageId = payload["messageId"];
    const readByUserId = payload["readByUserId"];
    const userId = payload["userId"];
    const readAt = payload["readAt"];
    const readUserId =
      typeof readByUserId === "string"
        ? readByUserId
        : typeof userId === "string"
          ? userId
          : undefined;
    if (
      convId === conversationId &&
      typeof messageId === "string" &&
      messageId.length > 0 &&
      readUserId
    ) {
      actions.markMessagesRead(
        conversationId,
        messageId,
        readUserId,
        typeof readAt === "string" ? readAt : new Date().toISOString()
      );
    }
  };

  const handleAttachmentDeleted = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const convId = payload["conversationId"];
    const messageId = payload["messageId"];
    const attachmentId = payload["attachmentId"];
    if (
      convId === conversationId &&
      typeof messageId === "string" &&
      typeof attachmentId === "string"
    ) {
      actions.removeAttachment(conversationId, messageId, attachmentId);
    }
  };

  const handleQueueStatus = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const convId = payload["conversationId"];
    const queuePosition = payload["queuePosition"];
    const estimatedWaitMinutes = payload["estimatedWaitMinutes"];
    if (
      convId === conversationId &&
      typeof queuePosition === "number" &&
      typeof estimatedWaitMinutes === "number"
    ) {
      actions.setQueueStatus(conversationId, payload as unknown as QueueStatusPayload);
    }
  };

  const handleQueueUpdated = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const count = payload["count"];
    if (typeof count === "number" && Number.isFinite(count)) {
      actions.setOutboundQueueCount(count);
    }
  };

  const handleSupportPresence = (payload: unknown) => {
    if (!isRecord(payload)) return;
    const parsedCount = Number(payload["onlineCount"] ?? payload["onlineAgentCount"] ?? 0);
    const rawCount = Number.isFinite(parsedCount) ? parsedCount : 0;
    actions.setSupportPresence({
      onlineCount: rawCount,
      onlineAgentCount: rawCount,
      isSupportOnline: Boolean(payload["isSupportOnline"] ?? rawCount > 0),
      agents: Array.isArray(payload["agents"])
        ? (payload["agents"] as SupportPresencePayload["agents"])
        : [],
    });
  };

  socket.onEvent("message:new", handleNewMessage);
  socket.onEvent("message:delivered", handleMessageDelivered);
  socket.onEvent("message:failed", handleMessageFailed);
  socket.onEvent("error", handleMessageFailed);
  socket.onEvent("typing:update", handleTypingUpdate);
  socket.onEvent("message:read", handleMessageRead);
  socket.onEvent("attachment:deleted", handleAttachmentDeleted);
  socket.onEvent("conversation:queue_status", handleQueueStatus);
  socket.onEvent("queue:updated", handleQueueUpdated);
  socket.onEvent("support:presence", handleSupportPresence);
  socket.onEvent("reconnect", onReconnect);

  return () => {
    clearTypingExpiry();
    socket.offEvent("message:new", handleNewMessage);
    socket.offEvent("message:delivered", handleMessageDelivered);
    socket.offEvent("message:failed", handleMessageFailed);
    socket.offEvent("error", handleMessageFailed);
    socket.offEvent("typing:update", handleTypingUpdate);
    socket.offEvent("message:read", handleMessageRead);
    socket.offEvent("attachment:deleted", handleAttachmentDeleted);
    socket.offEvent("conversation:queue_status", handleQueueStatus);
    socket.offEvent("queue:updated", handleQueueUpdated);
    socket.offEvent("support:presence", handleSupportPresence);
    socket.offEvent("reconnect", onReconnect);
  };
}
