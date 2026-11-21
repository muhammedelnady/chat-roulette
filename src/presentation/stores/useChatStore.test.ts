/** @format */

import type { MessageEntity } from "@/src/domain/entities";

import { useChatStore } from "./useChatStore";

describe("useChatStore", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it("upserts messages, updates status, marks read, and toggles reactions", () => {
    const msg: MessageEntity = {
      id: "m-1",
      clientId: "c-1",
      conversationId: "room-1",
      senderType: "USER",
      content: "Hello",
      contentType: "text",
      status: "PENDING",
      isEdited: false,
      createdAt: "2026-11-21T00:00:00.000Z",
      attachments: [],
    };

    useChatStore.getState().upsertMessage("room-1", msg);
    expect(useChatStore.getState().messages["room-1"]).toHaveLength(1);

    useChatStore.getState().updateMessageStatus("room-1", "c-1", "DELIVERED");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.status).toBe("DELIVERED");

    useChatStore
      .getState()
      .markMessagesRead("room-1", "m-1", "partner-1", "2026-11-21T00:01:00.000Z");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.status).toBe("READ");

    useChatStore.getState().toggleMessageReaction("room-1", "m-1", "⚡");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.reactions?.["⚡"]).toEqual(["you"]);

    useChatStore.getState().toggleMessageReaction("room-1", "m-1", "⚡");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.reactions?.["⚡"]).toBeUndefined();
  });
});
