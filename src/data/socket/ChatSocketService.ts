/** @format */
/**
 * Data Socket Chat Socket Service
 */

import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

import type { IConnectivityChecker, ITokensStorage } from "@/src/domain/repositories";
import { isOk } from "@/src/domain/Result";
import type { ChatSocketLogger, IChatSocketService } from "@/src/domain/services";
import { getStorageSync } from "@/src/infrastructure/storage/mmkvStorage";

import { ChatOutboundQueue, type QueuedMessage } from "./ChatOutboundQueue";

const LOCAL_ONLY_EVENTS = new Set(["reconnect", "queue:updated", "message:failed"]);
const ACK_TIMEOUT_MS = 15_000;

export class ChatSocketService implements IChatSocketService {
  private socket: Socket | null = null;
  private activeConversationId: string | null = null;
  private outboundQueue: ChatOutboundQueue;
  private listeners: { event: string; handler: (...args: unknown[]) => void }[] = [];
  private connectPromise: Promise<void> | null = null;
  private handleManagerReconnect: ((attempt: number) => void) | null = null;
  private unsubscribeConnectivity: (() => void) | null = null;
  private pendingAckTimers = new Map<string, ReturnType<typeof setTimeout>>();

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
    this.unsubscribeConnectivity =
      this.connectivity?.observeConnectivity?.((isConnected) => {
        if (!isConnected) return;
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        } else {
          this.drainBuffer();
        }
      }) ?? null;
  }

  private emitLocal(event: string, payload: unknown): void {
    for (const listener of [...this.listeners]) {
      if (listener.event === event) {
        try {
          listener.handler(payload);
        } catch (err) {
          this.logger.error(`[ChatSocket] Listener error for ${event}:`, err);
        }
      }
    }
  }

  private emitQueueCount(): void {
    this.emitLocal("queue:updated", { count: this.outboundQueue.size });
  }

  private clearAckTimer(clientId: string): void {
    const timer = this.pendingAckTimers.get(clientId);
    if (timer) {
      clearTimeout(timer);
      this.pendingAckTimers.delete(clientId);
    }
  }

  private clearAllAckTimers(): void {
    for (const timer of this.pendingAckTimers.values()) {
      clearTimeout(timer);
    }
    this.pendingAckTimers.clear();
  }

  getPendingQueueCount(): number {
    return this.outboundQueue.size;
  }

  async connect(token?: string, guestSessionId?: string): Promise<void> {
    if (this.connectPromise) {
      return this.connectPromise;
    }
    this.connectPromise = this.connectInternal(token, guestSessionId).finally(() => {
      this.connectPromise = null;
    });
    return this.connectPromise;
  }

  private async resolveCredentials(
    explicitToken?: string,
    explicitGuest?: string
  ): Promise<{ token?: string; guestSessionId?: string }> {
    let resolvedToken = explicitToken;
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
      explicitGuest ??
      (() => {
        try {
          return getStorageSync().getString("@chat_guest_session_id") ?? undefined;
        } catch {
          return undefined;
        }
      })();

    return { token: resolvedToken, guestSessionId: resolvedGuest };
  }

  private teardownSocket(): void {
    this.clearAllAckTimers();
    if (!this.socket) return;
    if (this.handleManagerReconnect) {
      this.socket.io.off("reconnect", this.handleManagerReconnect);
      this.handleManagerReconnect = null;
    }
    this.socket.off();
    this.socket.disconnect();
    this.socket = null;
  }

  private async connectInternal(token?: string, guestSessionId?: string): Promise<void> {
    const { token: resolvedToken, guestSessionId: resolvedGuest } = await this.resolveCredentials(
      token,
      guestSessionId
    );

    if (this.socket?.connected) {
      const currentAuth =
        typeof this.socket.auth === "object"
          ? (this.socket.auth as { token?: string; guestSessionId?: string })
          : undefined;
      if (currentAuth?.token === resolvedToken && currentAuth?.guestSessionId === resolvedGuest) {
        return;
      }
      this.socket.auth = {
        token: resolvedToken ?? undefined,
        guestSessionId: resolvedGuest,
      };
      this.socket.disconnect();
      this.socket.connect();
      return;
    }

    this.teardownSocket();

    const baseUrl = this.apiUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "");

    this.socket = io(baseUrl, {
      path: "/ws/chat",
      forceNew: true,
      auth: (cb) => {
        void this.resolveCredentials(token, guestSessionId).then((creds) => cb(creds));
      },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15_000,
    });

    this.socket.auth = {
      token: resolvedToken ?? undefined,
      guestSessionId: resolvedGuest,
    };

    this.socket.on("connect", () => {
      this.logger.info("[ChatSocket] Connected");
      if (this.activeConversationId) {
        this.socket?.emit("conversation:join", this.activeConversationId);
      }
      this.drainBuffer();
    });

    this.socket.on("message:delivered", (data: { clientId?: string }) => {
      if (!data.clientId) return;
      this.clearAckTimer(data.clientId);
      if (this.outboundQueue.removeDelivered(data.clientId)) {
        this.emitQueueCount();
      }
    });

    this.socket.on("error", (data: { clientId?: string; message?: string }) => {
      const clientId = data.clientId;
      if (!clientId) return;
      this.clearAckTimer(clientId);
      const updated = this.outboundQueue.markDeliveryFailed(clientId);
      this.emitQueueCount();
      if (updated?.status === "FAILED") {
        this.emitLocal("message:failed", {
          conversationId: updated.conversationId,
          clientId: updated.clientId,
        });
      }
    });

    this.socket.on("disconnect", (reason) => {
      this.logger.info("[ChatSocket] Disconnected:", reason);
    });

    this.socket.on("connect_error", (err) => {
      this.logger.error("[ChatSocket] Connection error:", err.message);
    });

    this.handleManagerReconnect = (attempt: number) => {
      this.logger.info("[ChatSocket] Reconnected after", attempt, "attempt(s)");
      this.emitLocal("reconnect", attempt);
    };
    this.socket.io.on("reconnect", this.handleManagerReconnect);

    this.reSubscribeListeners();
  }

  private drainBuffer(): void {
    if (!this.socket?.connected || !this.isAppOnline()) return;
    this.outboundQueue.drain((event, payload) => {
      this.socket?.emit(event, payload);
    });
    this.emitQueueCount();
  }

  private reSubscribeListeners(): void {
    for (const { event, handler } of this.listeners) {
      if (!LOCAL_ONLY_EVENTS.has(event)) {
        this.socket?.on(event, handler);
      }
    }
  }

  disconnect(): void {
    this.activeConversationId = null;
    this.teardownSocket();
  }

  dispose(): void {
    this.disconnect();
    this.unsubscribeConnectivity?.();
    this.unsubscribeConnectivity = null;
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
      this.emitQueueCount();
      this.logger.warn("[ChatSocket] Buffered outbound message in MMKV");
      return;
    }

    this.clearAckTimer(data.clientId);
    const timer = setTimeout(() => {
      this.pendingAckTimers.delete(data.clientId);
      this.outboundQueue.enqueue({
        ...data,
        status: "PENDING",
        createdAt: Date.now(),
        retryCount: 1,
      });
      this.emitQueueCount();
      this.emitLocal("message:failed", {
        conversationId: data.conversationId,
        clientId: data.clientId,
      });
    }, ACK_TIMEOUT_MS);
    this.pendingAckTimers.set(data.clientId, timer);

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
    if (!this.socket?.connected) return;
    this.socket.emit("typing:start", conversationId);
  }

  stopTyping(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("typing:stop", conversationId);
  }

  markMessageRead(conversationId: string, messageId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("message:read", { conversationId, messageId });
  }

  onEvent(event: string, handler: (...args: unknown[]) => void): void {
    const exists = this.listeners.some((l) => l.event === event && l.handler === handler);
    if (!exists) {
      this.listeners.push({ event, handler });
      if (!LOCAL_ONLY_EVENTS.has(event)) {
        this.socket?.on(event, handler);
      }
    }
  }

  offEvent(event: string, handler?: (...args: unknown[]) => void): void {
    if (handler) {
      this.listeners = this.listeners.filter((l) => !(l.event === event && l.handler === handler));
      if (!LOCAL_ONLY_EVENTS.has(event)) {
        this.socket?.off(event, handler);
      }
    } else {
      const removed = this.listeners.filter((l) => l.event === event);
      this.listeners = this.listeners.filter((l) => l.event !== event);
      if (!LOCAL_ONLY_EVENTS.has(event)) {
        for (const l of removed) {
          this.socket?.off(event, l.handler);
        }
      }
    }
  }
}
