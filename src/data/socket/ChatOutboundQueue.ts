/** @format */
/**
 * Data Socket Chat Outbound Queue
 */

import { getStorageSync } from "@/src/data/cache/mmkvStorage";
import type { ChatSocketLogger } from "@/src/domain/services";

const OUTBOUND_QUEUE_KEY = "@chat_outbound_queue";

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
}

export type OutboundEmitter = (event: string, payload: unknown) => void;

export class ChatOutboundQueue {
  private static readonly MAX_RETRIES = 5;
  private buffer: { event: string; payload: unknown }[] = [];

  constructor(private readonly logger: ChatSocketLogger) {
    this.loadPersisted();
  }

  get size(): number {
    return this.buffer.length;
  }

  enqueue(message: QueuedMessage): void {
    const existingIndex = this.buffer.findIndex(
      (item) => (item.payload as QueuedMessage).clientId === message.clientId
    );
    if (existingIndex >= 0) {
      this.buffer[existingIndex] = { event: "message:send", payload: message };
    } else {
      this.buffer.push({ event: "message:send", payload: message });
    }
    this.persist();
  }

  drain(emit: OutboundEmitter): void {
    const retryable = this.buffer.filter(
      (item) =>
        (item.payload as QueuedMessage).status !== "FAILED" &&
        (item.payload as QueuedMessage).retryCount < ChatOutboundQueue.MAX_RETRIES
    );
    if (retryable.length === 0) return;
    this.logger.info("[ChatSocket] Flushing", retryable.length, "buffered item(s)");
    for (const item of retryable) {
      const payload = item.payload as QueuedMessage;
      payload.status = "SENDING";
      emit(item.event, payload);
    }
    this.persist();
  }

  removeDelivered(clientId: string): boolean {
    const before = this.buffer.length;
    this.buffer = this.buffer.filter(
      (item) => (item.payload as QueuedMessage).clientId !== clientId
    );
    if (before === this.buffer.length) return false;
    this.persist();
    return true;
  }

  markDeliveryFailed(clientId: string): QueuedMessage | null {
    const queued = this.buffer.find(
      (item) => (item.payload as QueuedMessage).clientId === clientId
    );
    if (!queued) return null;
    const payload = queued.payload as QueuedMessage;
    payload.retryCount += 1;
    payload.status = payload.retryCount >= ChatOutboundQueue.MAX_RETRIES ? "FAILED" : "PENDING";
    this.persist();
    return payload;
  }

  clear(): void {
    this.buffer = [];
    this.persist();
  }

  private loadPersisted(): void {
    try {
      const storage = getStorageSync();
      const raw = storage.getString(OUTBOUND_QUEUE_KEY);
      if (!raw) return;
      const queued = JSON.parse(raw) as QueuedMessage[];
      for (const message of queued) {
        this.buffer.push({ event: "message:send", payload: message });
      }
      this.logger.info(
        `[ChatSocket] Loaded ${queued.length} persisted outbound message(s) from MMKV`
      );
    } catch (err) {
      this.logger.warn("[ChatSocket] Failed to load persisted outbound queue:", err);
    }
  }

  private persist(): void {
    try {
      const storage = getStorageSync();
      const sendMessages = this.buffer.map((item) => item.payload as QueuedMessage);
      if (sendMessages.length > 0) {
        storage.setString(OUTBOUND_QUEUE_KEY, JSON.stringify(sendMessages));
      } else {
        storage.delete(OUTBOUND_QUEUE_KEY);
      }
    } catch (err) {
      this.logger.warn("[ChatSocket] Failed to persist outbound queue to MMKV:", err);
    }
  }
}
