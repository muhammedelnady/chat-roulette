/** @format */

import { SimulatedChatEngine } from "./SimulatedChatEngine";
import { SimulatedChatSocketService } from "./SimulatedChatRepositories";

describe("SimulatedChatEngine & SimulatedChatSocketService", () => {
  it("lists seeded rooms, matches roulette partners by topic, and toggles reactions", () => {
    const engine = new SimulatedChatEngine();
    const rooms = engine.listConversations();
    expect(rooms.length).toBeGreaterThanOrEqual(5);

    const matched = engine.matchRoulette("AI Agents");
    expect(matched.isRouletteMatch).toBe(true);
    expect(matched.topic).toBe("AI Agents");

    const toggled = engine.toggleReaction("room-rn-architecture", "msg-rn-1", "⚡");
    expect(toggled?.reactions?.["⚡"]).not.toContain("you");

    const reToggled = engine.toggleReaction("room-rn-architecture", "msg-rn-1", "⚡");
    expect(reToggled?.reactions?.["⚡"]).toContain("you");
  });

  it("queues outbound messages while offline and flushes when back online", () => {
    jest.useFakeTimers();
    let online = false;
    let listener: ((isConnected: boolean) => void) | undefined;

    const connectivity = {
      isConnected: () => online,
      observeConnectivity: (cb: (isConnected: boolean) => void) => {
        listener = cb;
        return () => {};
      },
    };
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const engine = new SimulatedChatEngine();
    const socket = new SimulatedChatSocketService(logger, connectivity, engine);
    const deliveredHandler = jest.fn();
    socket.onEvent("message:delivered", deliveredHandler);

    socket.connect();
    socket.sendMessage({
      conversationId: "room-rn-architecture",
      clientId: "offline-c-1",
      content: "Queued while offline",
    });

    expect(socket.getPendingQueueCount()).toBe(1);
    expect(deliveredHandler).not.toHaveBeenCalled();

    online = true;
    listener?.(true);

    jest.advanceTimersByTime(300);
    expect(deliveredHandler).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: "offline-c-1" })
    );
    expect(socket.getPendingQueueCount()).toBe(0);
    jest.useRealTimers();
  });
});
