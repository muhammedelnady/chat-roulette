/** @format */

import { getStorageSync } from "@/src/data/cache/mmkvStorage";

import { ChatOutboundQueue, type QueuedMessage } from "./ChatOutboundQueue";

describe("ChatOutboundQueue", () => {
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getStorageSync().clearAll();
  });

  const makeMessage = (clientId: string): QueuedMessage => ({
    clientId,
    conversationId: "room-rn-architecture",
    content: "Offline message",
    status: "PENDING",
    createdAt: Date.now(),
    retryCount: 0,
  });

  it("enqueues, drains, and removes delivered items", () => {
    const queue = new ChatOutboundQueue(logger);
    queue.enqueue(makeMessage("c-1"));
    queue.enqueue(makeMessage("c-2"));
    expect(queue.size).toBe(2);

    const emitted: string[] = [];
    queue.drain((_event, payload) => {
      emitted.push((payload as QueuedMessage).clientId);
    });
    expect(emitted).toEqual(["c-1", "c-2"]);

    expect(queue.removeDelivered("c-1")).toBe(true);
    expect(queue.size).toBe(1);
    expect(queue.removeDelivered("missing")).toBe(false);
  });

  it("marks delivery failures up to max retries", () => {
    const queue = new ChatOutboundQueue(logger);
    queue.enqueue(makeMessage("c-fail"));

    for (let i = 0; i < 4; i += 1) {
      const res = queue.markDeliveryFailed("c-fail");
      expect(res?.status).toBe("PENDING");
    }
    const final = queue.markDeliveryFailed("c-fail");
    expect(final?.status).toBe("FAILED");

    const emitFn = jest.fn();
    queue.drain(emitFn);
    expect(emitFn).not.toHaveBeenCalled();
  });
});
