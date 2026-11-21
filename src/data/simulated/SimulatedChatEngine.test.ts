/** @format */

import { resetStorageForTests } from "@/src/infrastructure/storage/mmkvStorage";

import { SimulatedChatEngine } from "./SimulatedChatEngine";
import {
  SimulatedChatSocketService,
  SimulatedMessageRepository,
} from "./SimulatedChatRepositories";

describe("SimulatedChatEngine & SimulatedChatSocketService", () => {
  beforeEach(() => {
    resetStorageForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deep-clones entities, matches roulette, marks read, deletes attachments, and syncs reactions", () => {
    const engine = new SimulatedChatEngine();
    const rooms = engine.listConversations();
    expect(rooms.length).toBeGreaterThanOrEqual(5);

    const firstMsgs = engine.listMessages("room-rn-architecture");
    const lastMsg = firstMsgs[firstMsgs.length - 1];
    if (lastMsg && lastMsg.metadata) {
      lastMsg.metadata["mutated"] = true;
    }
    const freshMsgs = engine.listMessages("room-rn-architecture");
    const freshLast = freshMsgs[freshMsgs.length - 1];
    expect(freshLast?.metadata?.["mutated"]).toBeUndefined();

    engine.markConversationRead("room-rn-architecture");
    expect(engine.getConversationById("room-rn-architecture")?.unreadCount).toBe(0);

    const matched = engine.matchRoulette("AI Agents");
    expect(matched.isRouletteMatch).toBe(true);
    expect(matched.topic).toBe("AI Agents");

    const toggled = engine.toggleReaction(matched.id, matched.lastMessage?.id ?? "", "⚡");
    expect(toggled?.reactions?.["⚡"]).toContain("you");
    expect(engine.getConversationById(matched.id)?.lastMessage?.reactions?.["⚡"]).toContain("you");

    const msgWithAtt = engine.upsertMessage(matched.id, {
      id: "att-msg-1",
      clientId: "att-c-1",
      conversationId: matched.id,
      senderType: "USER",
      content: "See image",
      contentType: "attachment",
      isEdited: false,
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: "att-del-1",
          url: "https://example.com/a.png",
          mimeType: "image/png",
          fileName: "a.png",
          fileSize: 100,
        },
      ],
    });
    expect(msgWithAtt.attachments).toHaveLength(1);
    engine.deleteAttachment("att-del-1");
    const afterDelete = engine.listMessages(matched.id).find((item) => item.id === "att-msg-1");
    expect(afterDelete?.attachments[0]?.deletedAt).toBeTruthy();
    expect(
      engine.getConversationById(matched.id)?.lastMessage?.attachments[0]?.deletedAt
    ).toBeTruthy();
  });

  it("queues outbound messages offline, flushes on reconnect, and cancels reply timers on disconnect", async () => {
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
    const newMsgHandler = jest.fn();
    socket.onEvent("message:delivered", deliveredHandler);
    socket.onEvent("message:new", newMsgHandler);

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

    socket.disconnect();
    jest.advanceTimersByTime(3000);
    expect(newMsgHandler).not.toHaveBeenCalled();

    const simMsgRepo = new SimulatedMessageRepository(engine);
    const page = await simMsgRepo.list("room-rn-architecture", undefined, 1);
    expect("value" in page && page.value.data).toHaveLength(1);
    expect("value" in page && page.value.nextCursor).toBeTruthy();
  });
});
