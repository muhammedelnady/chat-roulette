/** @format */

import { getStorageSync, resetStorageForTests } from "@/src/infrastructure/storage/mmkvStorage";

import {
  ChatOutboundQueue,
  DEFAULT_OUTBOUND_QUEUE_KEY,
  type QueuedMessage,
} from "./ChatOutboundQueue";

describe("ChatOutboundQueue", () => {
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetStorageForTests();
    getStorageSync().clearAll();
  });

  const makeMessage = (clientId: string, createdAt = Date.now()): QueuedMessage => ({
    clientId,
    conversationId: "room-rn-architecture",
    content: "Offline message",
    status: "PENDING",
    createdAt,
    retryCount: 0,
  });

  it("enqueues, drains with wire metadata stripped, skips recent SENDING items, and removes delivered items", () => {
    const now = 1_700_000_000_000;
    const queue = new ChatOutboundQueue(logger);
    queue.enqueue(makeMessage("c-1", now));
    queue.enqueue(makeMessage("c-2", now));
    expect(queue.size).toBe(2);

    const emitted: Record<string, unknown>[] = [];
    queue.drain((_event, payload) => {
      emitted.push(payload as unknown as Record<string, unknown>);
    }, now);

    expect(emitted).toHaveLength(2);
    expect(emitted[0]).not.toHaveProperty("status");
    expect(emitted[0]).not.toHaveProperty("retryCount");
    expect(emitted[0]).not.toHaveProperty("lastAttemptAt");

    const emitWithinTimeout = jest.fn();
    queue.drain(emitWithinTimeout, now + 5_000);
    expect(emitWithinTimeout).not.toHaveBeenCalled();

    const emitAfterTimeout = jest.fn();
    queue.drain(emitAfterTimeout, now + 20_000);
    expect(emitAfterTimeout).toHaveBeenCalledTimes(2);

    expect(queue.removeDelivered("c-1")).toBe(true);
    expect(queue.size).toBe(1);
    expect(queue.removeDelivered("missing")).toBe(false);
  });

  it("tracks retry limits, excludes FAILED from size, and supports retryFailed", () => {
    const queue = new ChatOutboundQueue(logger);
    queue.enqueue(makeMessage("c-fail"));

    for (let i = 0; i < 4; i += 1) {
      const res = queue.markDeliveryFailed("c-fail");
      expect(res?.status).toBe("PENDING");
    }
    const final = queue.markDeliveryFailed("c-fail");
    expect(final?.status).toBe("FAILED");
    expect(queue.size).toBe(0);
    expect(queue.failedCount).toBe(1);

    const emitFn = jest.fn();
    queue.drain(emitFn);
    expect(emitFn).not.toHaveBeenCalled();

    expect(queue.retryFailed("c-fail")).toBe(true);
    expect(queue.size).toBe(1);
    expect(queue.failedCount).toBe(0);
    queue.drain(emitFn);
    expect(emitFn).toHaveBeenCalledTimes(1);
  });

  it("recovers SENDING -> PENDING on boot, purges corrupt JSON, and caps buffer at 100 items", () => {
    const storage = getStorageSync();
    storage.setString(
      DEFAULT_OUTBOUND_QUEUE_KEY,
      JSON.stringify([
        {
          clientId: "in-flight-boot",
          conversationId: "room-1",
          status: "SENDING",
          createdAt: 1000,
          retryCount: 1,
          lastAttemptAt: 1000,
        },
      ])
    );

    const rebooted = new ChatOutboundQueue(logger);
    expect(rebooted.size).toBe(1);
    const emitBoot = jest.fn();
    rebooted.drain(emitBoot, 1200);
    expect(emitBoot).toHaveBeenCalledTimes(1);

    storage.setString("@corrupt_queue", "{bad-json");
    const corruptQueue = new ChatOutboundQueue(logger, "@corrupt_queue");
    expect(corruptQueue.size).toBe(0);
    expect(storage.getString("@corrupt_queue")).toBeUndefined();

    const cappedQueue = new ChatOutboundQueue(logger, "@capped_queue");
    for (let i = 0; i < 105; i += 1) {
      cappedQueue.enqueue(makeMessage(`m-${i}`, i));
    }
    expect(cappedQueue.size).toBe(100);
  });
});
