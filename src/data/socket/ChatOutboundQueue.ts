/** @format */
/**
 * Data Socket Chat Outbound Queue
 */

import { z } from "zod/v4";

import type { ChatSocketLogger } from "@/src/domain/services";
import { getStorageSync } from "@/src/infrastructure/storage/mmkvStorage";

export const DEFAULT_OUTBOUND_QUEUE_KEY = "@chat_outbound_queue:socket";
const MAX_QUEUE_SIZE = 100;
const IN_FLIGHT_TIMEOUT_MS = 15_000;

export interface QueuedAttachment {
  uploadId?: string;
  url: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width?: number;
  height?: number;
  cloudinaryId?: string;
}

export interface QueuedMessage {
  clientId: string;
  conversationId: string;
  content?: string;
  contentType?: string;
  metadata?: Record<string, unknown> | null;
  replyToId?: string;
  attachments?: QueuedAttachment[];
  status: "PENDING" | "SENDING" | "FAILED";
  createdAt: number;
  retryCount: number;
  lastAttemptAt?: number;
}

export type OutboundWirePayload = Omit<
  QueuedMessage,
  "status" | "createdAt" | "retryCount" | "lastAttemptAt"
>;

export type OutboundEmitter = (event: string, payload: OutboundWirePayload) => void;

const queuedAttachmentSchema = z.object({
  uploadId: z.string().optional(),
  url: z.string(),
  mimeType: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  cloudinaryId: z.string().optional(),
});

const queuedMessageSchema = z.object({
  clientId: z.string().min(1),
  conversationId: z.string().min(1),
  content: z.string().optional(),
  contentType: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  replyToId: z.string().optional(),
  attachments: z.array(queuedAttachmentSchema).optional(),
  status: z.enum(["PENDING", "SENDING", "FAILED"]),
  createdAt: z.number(),
  retryCount: z.number(),
  lastAttemptAt: z.number().optional(),
});

const persistedQueueSchema = z.array(queuedMessageSchema);

function toWirePayload(msg: QueuedMessage): OutboundWirePayload {
  return {
    clientId: msg.clientId,
    conversationId: msg.conversationId,
    ...(msg.content !== undefined ? { content: msg.content } : {}),
    ...(msg.contentType !== undefined ? { contentType: msg.contentType } : {}),
    ...(msg.metadata !== undefined ? { metadata: msg.metadata } : {}),
    ...(msg.replyToId !== undefined ? { replyToId: msg.replyToId } : {}),
    ...(msg.attachments !== undefined ? { attachments: msg.attachments } : {}),
  };
}

export class ChatOutboundQueue {
  private static readonly MAX_RETRIES = 5;
  private buffer: QueuedMessage[] = [];

  constructor(
    private readonly logger: ChatSocketLogger,
    private readonly storageKey: string = DEFAULT_OUTBOUND_QUEUE_KEY
  ) {
    this.loadPersisted();
  }

  get size(): number {
    return this.buffer.filter((item) => item.status !== "FAILED").length;
  }

  get failedCount(): number {
    return this.buffer.filter((item) => item.status === "FAILED").length;
  }

  enqueue(message: QueuedMessage): void {
    const existingIndex = this.buffer.findIndex((item) => item.clientId === message.clientId);
    if (existingIndex >= 0) {
      this.buffer[existingIndex] = { ...message };
    } else {
      if (this.buffer.length >= MAX_QUEUE_SIZE) {
        const dropIndex = this.buffer.findIndex((item) => item.status === "FAILED");
        if (dropIndex >= 0) {
          this.buffer.splice(dropIndex, 1);
        } else {
          this.buffer.shift();
        }
      }
      this.buffer.push({ ...message });
    }
    this.persist();
  }

  drain(emit: OutboundEmitter, now: number = Date.now()): void {
    const retryable = this.buffer.filter((item) => {
      if (item.status === "FAILED" || item.retryCount >= ChatOutboundQueue.MAX_RETRIES) {
        return false;
      }
      if (item.status === "SENDING") {
        return now - (item.lastAttemptAt ?? 0) >= IN_FLIGHT_TIMEOUT_MS;
      }
      return true;
    });
    if (retryable.length === 0) return;

    this.logger.info("[ChatSocket] Flushing", retryable.length, "buffered item(s)");
    for (const msg of retryable) {
      msg.status = "SENDING";
      msg.lastAttemptAt = now;
    }
    this.persist();

    for (const msg of retryable) {
      try {
        emit("message:send", toWirePayload(msg));
      } catch (err) {
        this.logger.warn("[ChatSocket] Emit error while draining queue:", err);
        msg.status = "PENDING";
      }
    }
    this.persist();
  }

  removeDelivered(clientId: string): boolean {
    const before = this.buffer.length;
    this.buffer = this.buffer.filter((item) => item.clientId !== clientId);
    if (before === this.buffer.length) return false;
    this.persist();
    return true;
  }

  markDeliveryFailed(clientId: string): QueuedMessage | null {
    const msg = this.buffer.find((item) => item.clientId === clientId);
    if (!msg) return null;
    msg.retryCount += 1;
    msg.status = msg.retryCount >= ChatOutboundQueue.MAX_RETRIES ? "FAILED" : "PENDING";
    this.persist();
    return msg;
  }

  retryFailed(clientId: string): boolean {
    const msg = this.buffer.find((item) => item.clientId === clientId);
    if (!msg) return false;
    msg.retryCount = 0;
    msg.status = "PENDING";
    msg.lastAttemptAt = undefined;
    this.persist();
    return true;
  }

  reload(): void {
    const existingIds = new Set(this.buffer.map((m) => m.clientId));
    const loaded = this.readPersistedItems();
    for (const item of loaded) {
      if (!existingIds.has(item.clientId)) {
        this.buffer.unshift(item);
      }
    }
  }

  clear(): void {
    this.buffer = [];
    this.persist();
  }

  private readPersistedItems(): QueuedMessage[] {
    try {
      const storage = getStorageSync();
      const raw = storage.getString(this.storageKey);
      if (!raw) return [];
      const parsedJson: unknown = JSON.parse(raw);
      const parsed = persistedQueueSchema.safeParse(parsedJson);
      if (!parsed.success) {
        this.logger.warn("[ChatSocket] Corrupt persisted outbound queue purged");
        storage.delete(this.storageKey);
        return [];
      }
      return parsed.data.map((msg) =>
        msg.status === "SENDING" ? { ...msg, status: "PENDING" as const } : msg
      );
    } catch (err) {
      this.logger.warn("[ChatSocket] Failed to load persisted outbound queue:", err);
      try {
        getStorageSync().delete(this.storageKey);
      } catch {}
      return [];
    }
  }

  private loadPersisted(): void {
    const queued = this.readPersistedItems();
    if (queued.length === 0) return;
    this.buffer = queued;
    this.logger.info(
      `[ChatSocket] Loaded ${queued.length} persisted outbound message(s) from MMKV`
    );
  }

  private persist(): void {
    try {
      const storage = getStorageSync();
      if (this.buffer.length > 0) {
        storage.setString(this.storageKey, JSON.stringify(this.buffer));
      } else {
        storage.delete(this.storageKey);
      }
    } catch (err) {
      this.logger.warn("[ChatSocket] Failed to persist outbound queue to MMKV:", err);
    }
  }
}
