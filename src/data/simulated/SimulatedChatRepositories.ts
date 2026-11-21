/** @format */
/**
 * Data Simulated Chat Repositories & Socket Service
 */

import { ChatOutboundQueue, type QueuedMessage } from "@/src/data/socket/ChatOutboundQueue";
import type {
  ConversationEntity,
  MessageAttachmentEntity,
  MessageAttachmentInput,
  MessageEntity,
} from "@/src/domain/entities";
import { NotFoundError, type AppError } from "@/src/domain/errors";
import type {
  IConnectivityChecker,
  IConversationRepository,
  IMessageRepository,
  UploadAudioResult,
} from "@/src/domain/repositories";
import { err, ok, type Result } from "@/src/domain/Result";
import type { ChatSocketLogger, IChatSocketService } from "@/src/domain/services";
import { generateUUID } from "@/src/domain/utils/uuid";

import { type SimulatedChatEngine, sharedSimulatedChatEngine } from "./SimulatedChatEngine";

export class SimulatedChatRepository implements IConversationRepository {
  constructor(private readonly engine: SimulatedChatEngine = sharedSimulatedChatEngine) {}

  async list(): Promise<
    Result<{ data: ConversationEntity[]; nextCursor: string | null }, AppError>
  > {
    await Promise.resolve();
    return ok({
      data: this.engine.listConversations(),
      nextCursor: null,
    });
  }

  async getById(conversationId: string): Promise<Result<ConversationEntity | null, AppError>> {
    await Promise.resolve();
    return ok(this.engine.getConversationById(conversationId));
  }

  async create(params: {
    scope?: string;
    subject?: string;
    topic?: string;
    category?: string;
  }): Promise<Result<ConversationEntity, AppError>> {
    await Promise.resolve();
    return ok(this.engine.createConversation(params));
  }

  async matchRoulette(topic?: string): Promise<Result<ConversationEntity, AppError>> {
    await Promise.resolve();
    return ok(this.engine.matchRoulette(topic));
  }

  async close(conversationId: string): Promise<Result<ConversationEntity, AppError>> {
    await Promise.resolve();
    const closed = this.engine.closeConversation(conversationId);
    if (!closed) {
      return err(new NotFoundError(`Conversation ${conversationId}`));
    }
    return ok(closed);
  }
}

export class SimulatedMessageRepository implements IMessageRepository {
  constructor(private readonly engine: SimulatedChatEngine = sharedSimulatedChatEngine) {}

  async list(
    conversationId: string
  ): Promise<Result<{ data: MessageEntity[]; nextCursor: string | null }, AppError>> {
    await Promise.resolve();
    return ok({
      data: this.engine.listMessages(conversationId),
      nextCursor: null,
    });
  }

  async send(params: {
    conversationId: string;
    content: string;
    contentType?: string;
    metadata?: Record<string, unknown> | null;
    clientId?: string;
    replyToId?: string;
    attachments?: (MessageAttachmentEntity | MessageAttachmentInput)[];
  }): Promise<Result<MessageEntity, AppError>> {
    await Promise.resolve();
    const clientId = params.clientId ?? generateUUID();
    const entity: MessageEntity = {
      id: `msg-${clientId}`,
      clientId,
      conversationId: params.conversationId,
      senderType: "USER",
      senderName: "You",
      content: params.content,
      contentType: params.contentType ?? "text",
      metadata: params.metadata ?? null,
      replyToId: params.replyToId ?? null,
      status: "DELIVERED",
      isEdited: false,
      createdAt: new Date().toISOString(),
      attachments: (params.attachments ?? []).map((att, idx) => ({
        id: att.id ?? att.uploadId ?? `att-${idx}`,
        uploadId: att.uploadId,
        url: att.url,
        mimeType: att.mimeType,
        fileName: att.fileName,
        fileSize: att.fileSize,
        width: att.width,
        height: att.height,
        cloudinaryId: att.cloudinaryId,
      })),
    };
    return ok(this.engine.upsertMessage(params.conversationId, entity));
  }

  async markRead(): Promise<Result<void, AppError>> {
    await Promise.resolve();
    return ok(undefined);
  }

  async toggleReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<Result<MessageEntity | null, AppError>> {
    await Promise.resolve();
    return ok(this.engine.toggleReaction(conversationId, messageId, emoji));
  }

  async uploadAttachment(formData: FormData): Promise<Result<MessageAttachmentEntity, AppError>> {
    await Promise.resolve();
    const uploadId = `sim-att-${generateUUID().slice(0, 8)}`;
    const fileRecord = (
      formData as unknown as { _parts?: [string, { uri?: string; name?: string; type?: string }][] }
    )._parts?.[0]?.[1];
    return ok({
      id: uploadId,
      uploadId,
      url: fileRecord?.uri ?? "https://picsum.photos/seed/chatroulette/600/400",
      mimeType: fileRecord?.type ?? "image/jpeg",
      fileName: fileRecord?.name ?? "snapshot.jpg",
      fileSize: 128000,
    });
  }

  async uploadAudio(): Promise<Result<UploadAudioResult, AppError>> {
    await Promise.resolve();
    const uploadId = `sim-aud-${generateUUID().slice(0, 8)}`;
    return ok({
      uploadId,
      url: `simulated://${uploadId}.m4a`,
      fileName: `${uploadId}.m4a`,
      mimeType: "audio/m4a",
      fileSize: 48200,
      durationSeconds: 4,
      waveformBars: [0.3, 0.75, 0.55, 0.9, 0.65, 0.45, 0.85, 0.5, 0.35],
    });
  }

  async deleteAttachment(): Promise<Result<void, AppError>> {
    await Promise.resolve();
    return ok(undefined);
  }
}

export class SimulatedChatSocketService implements IChatSocketService {
  private connected = false;
  private activeConversationId: string | null = null;
  private outboundQueue: ChatOutboundQueue;
  private listeners: { event: string; handler: (...args: unknown[]) => void }[] = [];
  private activeTimers = new Set<ReturnType<typeof setTimeout>>();

  constructor(
    private readonly logger: ChatSocketLogger,
    private readonly connectivity?: IConnectivityChecker,
    private readonly engine: SimulatedChatEngine = sharedSimulatedChatEngine
  ) {
    this.outboundQueue = new ChatOutboundQueue(logger);
    this.connectivity?.observeConnectivity?.((isConnected) => {
      if (isConnected) {
        this.drainBuffer();
      }
      this.emitQueueCount();
    });
  }

  private emitLocal(event: string, payload: unknown): void {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        try {
          listener.handler(payload);
        } catch (error) {
          this.logger.error("[SimulatedSocket] Listener error:", error);
        }
      }
    }
  }

  private emitQueueCount(): void {
    this.emitLocal("queue:updated", { count: this.outboundQueue.size });
  }

  private schedule(fn: () => void, delayMs: number): void {
    const timer = setTimeout(() => {
      this.activeTimers.delete(timer);
      fn();
    }, delayMs);
    this.activeTimers.add(timer);
  }

  getPendingQueueCount(): number {
    return this.outboundQueue.size;
  }

  connect(): void {
    this.connected = true;
    if (this.connectivity?.isConnected() ?? true) {
      this.drainBuffer();
    }
    this.emitLocal("support:presence", {
      onlineCount: 168,
      onlineAgentCount: 168,
      isSupportOnline: true,
      agents: [],
    });
  }

  disconnect(): void {
    this.connected = false;
    for (const timer of this.activeTimers) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
  }

  isConnected(): boolean {
    return this.connected && (this.connectivity?.isConnected() ?? true);
  }

  joinConversation(conversationId: string): void {
    this.activeConversationId = conversationId;
    if (!this.connected) {
      this.connect();
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
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
    const isOnline = this.connectivity?.isConnected() ?? true;

    if (!isOnline) {
      const queuedMessage: QueuedMessage = {
        ...data,
        status: "PENDING",
        createdAt: Date.now(),
        retryCount: 0,
      };
      this.outboundQueue.enqueue(queuedMessage);
      this.emitQueueCount();
      return;
    }

    this.processOutboundPayload(data);
  }

  private processOutboundPayload(data: {
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
    const saved: MessageEntity = {
      id: data.clientId,
      clientId: data.clientId,
      conversationId: data.conversationId,
      senderType: "USER",
      senderName: "You",
      content: data.content ?? null,
      contentType: data.contentType ?? (data.attachments?.length ? "attachment" : "text"),
      metadata: data.metadata ?? null,
      replyToId: data.replyToId ?? null,
      status: "DELIVERED",
      isEdited: false,
      createdAt: new Date().toISOString(),
      attachments: (data.attachments ?? []).map((att, idx) => ({
        id: att.uploadId ?? `att-${idx}`,
        uploadId: att.uploadId,
        url: att.url,
        mimeType: att.mimeType,
        fileName: att.fileName,
        fileSize: att.fileSize,
        width: att.width,
        height: att.height,
        cloudinaryId: att.cloudinaryId,
      })),
    };
    this.engine.upsertMessage(data.conversationId, saved);

    this.schedule(() => {
      this.outboundQueue.removeDelivered(data.clientId);
      this.emitQueueCount();
      this.emitLocal("message:delivered", {
        conversationId: data.conversationId,
        clientId: data.clientId,
        messageId: saved.id,
      });
    }, 220);

    this.schedule(() => {
      this.emitLocal("message:read", {
        conversationId: data.conversationId,
        messageId: saved.id,
        readByUserId: "sim-partner",
        readAt: new Date().toISOString(),
      });
      this.emitLocal("typing:update", {
        conversationId: data.conversationId,
        userIds: ["sim-partner"],
      });
    }, 550);

    this.schedule(() => {
      this.emitLocal("typing:update", {
        conversationId: data.conversationId,
        userIds: [],
      });
      const reply = this.engine.buildSimulatedReply(data.conversationId, data.content);
      this.emitLocal("message:new", {
        conversationId: data.conversationId,
        message: reply,
      });
    }, 1500);
  }

  private drainBuffer(): void {
    if (!(this.connectivity?.isConnected() ?? true)) return;
    this.outboundQueue.drain((_event, payload) => {
      this.processOutboundPayload(payload as QueuedMessage);
    });
    this.emitQueueCount();
  }

  deleteAttachment(): void {}

  startTyping(): void {}

  stopTyping(): void {}

  markMessageRead(): void {}

  onEvent(event: string, handler: (...args: unknown[]) => void): void {
    this.listeners.push({ event, handler });
  }

  offEvent(event: string, handler?: (...args: unknown[]) => void): void {
    if (handler) {
      this.listeners = this.listeners.filter((l) => !(l.event === event && l.handler === handler));
    } else {
      this.listeners = this.listeners.filter((l) => l.event !== event);
    }
  }
}
