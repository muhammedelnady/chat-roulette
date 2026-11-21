/** @format */
/**
 * Data Socket Chat Socket Service
 */

import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

import { getStorageSync } from "@/src/data/cache/mmkvStorage";
import type { IConnectivityChecker, ITokensStorage } from "@/src/domain/repositories";
import { isOk } from "@/src/domain/Result";
import type { ChatSocketLogger, IChatSocketService } from "@/src/domain/services";

import { ChatOutboundQueue, type QueuedMessage } from "./ChatOutboundQueue";

export class ChatSocketService implements IChatSocketService {
  private socket: Socket | null = null;
  private activeConversationId: string | null = null;
  private outboundQueue: ChatOutboundQueue;
  private listeners: { event: string; handler: (...args: unknown[]) => void }[] = [];

  constructor(
    private readonly apiUrl: string,
    private readonly logger: ChatSocketLogger,
    private readonly connectivity?: IConnectivityChecker,
    private readonly tokenStorage?: ITokensStorage
  ) {
    this.outboundQueue = new ChatOutboundQueue(logger);
    this.subscribeToConnectivity();
  }

  private isAppOnline(): boolean {
    return this.connectivity?.isConnected() ?? true;
  }

  private subscribeToConnectivity(): void {
    this.connectivity?.observeConnectivity?.((isConnected) => {
      if (isConnected) this.drainBuffer();
    });
  }

  getPendingQueueCount(): number {
    return this.outboundQueue.size;
  }

  async connect(token?: string, guestSessionId?: string): Promise<void> {
    let resolvedToken = token;
    const storage = this.tokenStorage;
    if (!resolvedToken && storage) {
      try {
        if (typeof storage.getToken === "function") {
          const stored = await storage.getToken();
          resolvedToken = stored ?? undefined;
        } else {
          const tokensRes = await storage.getTokens();
          if (isOk(tokensRes) && tokensRes.value.accessToken) {
            resolvedToken = tokensRes.value.accessToken;
          }
        }
      } catch (err) {
        this.logger.warn("[ChatSocket] Failed to read token from storage", err);
      }
    }

    const resolvedGuest =
      guestSessionId ??
      (() => {
        try {
          return getStorageSync().getString("@chat_guest_session_id") ?? undefined;
        } catch {
          return undefined;
        }
      })();

    if (this.socket?.connected) {
      const opts = this.socket.io.opts as {
        auth?: { token?: string; guestSessionId?: string };
      };
      const currentToken = opts.auth?.token;
      const currentGuest = opts.auth?.guestSessionId;
      if (currentToken === resolvedToken && currentGuest === resolvedGuest) return;

      opts.auth = {
        token: resolvedToken ?? undefined,
        guestSessionId: resolvedGuest,
      };
      this.socket.disconnect();
      this.socket.connect();
      return;
    }

    if (this.socket) {
      this.socket.off();
      this.socket.disconnect();
      this.socket = null;
    }

    const baseUrl = this.apiUrl.replace(/\/api\/v1$/, "").replace(/\/$/, "");

    this.socket = io(baseUrl, {
      path: "/ws/chat",
      auth: {
        token: resolvedToken ?? undefined,
        guestSessionId: resolvedGuest,
      },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      this.logger.info("[ChatSocket] Connected");
      if (this.activeConversationId) {
        this.socket?.emit("conversation:join", this.activeConversationId);
      }
      this.drainBuffer();
    });

    this.socket.on("message:delivered", (data: { clientId?: string }) => {
      if (!data.clientId) return;
      this.outboundQueue.removeDelivered(data.clientId);
    });

    this.socket.on("error", (data: { clientId?: string; message?: string }) => {
      const clientId = data.clientId;
      if (!clientId) return;
      this.outboundQueue.markDeliveryFailed(clientId);
    });

    this.socket.on("disconnect", (reason) => {
      this.logger.info("[ChatSocket] Disconnected:", reason);
    });

    this.socket.on("connect_error", (err) => {
      this.logger.error("[ChatSocket] Connection error:", err.message);
    });

    this.socket.io.on("reconnect", (attempt) => {
      this.logger.info("[ChatSocket] Reconnected after", attempt, "attempt(s)");
      if (this.activeConversationId) {
        this.socket?.emit("conversation:join", this.activeConversationId);
      }
      this.drainBuffer();
      for (const listener of this.listeners) {
        if (listener.event === "reconnect") {
          try {
            listener.handler(attempt);
          } catch (err) {
            this.logger.error("[ChatSocket] Reconnect listener error:", err);
          }
        }
      }
    });

    this.reSubscribeListeners();
  }

  private drainBuffer(): void {
    if (!this.socket?.connected || !this.isAppOnline()) return;
    this.outboundQueue.drain((event, payload) => this.socket?.emit(event, payload));
  }

  private reSubscribeListeners(): void {
    for (const { event, handler } of this.listeners) {
      this.socket?.on(event, handler);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.activeConversationId = null;
      this.socket.off();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  joinConversation(conversationId: string): void {
    this.activeConversationId = conversationId;
    this.socket?.emit("conversation:join", conversationId);
  }

  leaveConversation(conversationId: string): void {
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
    this.socket?.emit("conversation:leave", conversationId);
  }

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
  }): void {
    if (!this.socket?.connected || !this.isAppOnline()) {
      const queuedMessage: QueuedMessage = {
        ...data,
        status: "PENDING",
        createdAt: Date.now(),
        retryCount: 0,
      };
      this.outboundQueue.enqueue(queuedMessage);
      this.logger.warn("[ChatSocket] Buffered outbound message in MMKV");
      return;
    }
    this.socket.emit("message:send", data);
  }

  deleteAttachment(data: {
    attachmentId: string;
    conversationId: string;
    messageId?: string;
  }): void {
    if (!this.socket?.connected) return;
    this.socket.emit("attachment:delete", data);
  }

  startTyping(conversationId: string): void {
    this.socket?.emit("typing:start", conversationId);
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit("typing:stop", conversationId);
  }

  markMessageRead(conversationId: string, messageId: string): void {
    this.socket?.emit("message:read", { conversationId, messageId });
  }

  onEvent(event: string, handler: (...args: unknown[]) => void): void {
    this.listeners.push({ event, handler });
    this.socket?.on(event, handler);
  }

  offEvent(event: string, handler?: (...args: unknown[]) => void): void {
    if (handler) {
      this.listeners = this.listeners.filter((l) => !(l.event === event && l.handler === handler));
      this.socket?.off(event, handler);
    } else {
      this.listeners = this.listeners.filter((l) => l.event !== event);
      this.socket?.off(event);
    }
  }
}
