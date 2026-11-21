/** @format */

import type { ConversationEntity, MessageEntity } from "@/src/domain/entities";

import {
  selectChatError,
  selectConversations,
  selectCurrentConversationId,
  selectIsLoadingConversations,
  selectIsLoadingMessages,
  selectMessages,
  selectNextCursor,
  selectQueueStatus,
  selectSupportPresence,
  selectTypingUsers,
  useChatStore,
} from "./useChatStore";

const baseConv: ConversationEntity = {
  id: "room-1",
  scope: "ROOM",
  handledBy: "COMMUNITY",
  status: "OPEN",
  subject: "Expo Architecture",
  unreadCount: 3,
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  participants: [],
};

describe("useChatStore", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it("upserts messages, updates status, clears unread on read, deduplicates appendMessages, and toggles reactions", () => {
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
      attachments: [
        {
          id: "att-1",
          url: "https://example.com/a.png",
          mimeType: "image/png",
          fileName: "a.png",
          fileSize: 100,
        },
      ],
    };

    useChatStore.getState().setConversations([baseConv]);
    useChatStore.getState().appendConversations([{ ...baseConv, id: "room-2" }]);
    useChatStore
      .getState()
      .upsertConversation({ ...baseConv, subject: "Updated Room", unreadCount: 3 });
    useChatStore.getState().setCurrentConversationId("room-1");
    useChatStore.getState().upsertMessage("room-1", msg);
    expect(useChatStore.getState().messages["room-1"]).toHaveLength(1);

    useChatStore.getState().updateMessageStatus("room-1", "c-1", "DELIVERED");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.status).toBe("DELIVERED");

    const beforeNoop = useChatStore.getState().messages["room-1"];
    useChatStore.getState().updateMessageStatus("room-1", "missing-id", "READ");
    expect(useChatStore.getState().messages["room-1"]).toBe(beforeNoop);

    useChatStore
      .getState()
      .markMessagesRead("room-1", "m-1", "partner-1", "2026-11-21T00:01:00.000Z");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.status).toBe("READ");
    expect(useChatStore.getState().conversations["room-1"]?.unreadCount).toBe(0);

    useChatStore.getState().toggleMessageReaction("room-1", "m-1", "⚡");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.reactions?.["⚡"]).toEqual(["you"]);

    useChatStore.getState().toggleMessageReaction("room-1", "m-1", "⚡");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.reactions?.["⚡"]).toBeUndefined();

    useChatStore.getState().removeAttachment("room-1", "m-1", "att-1");
    expect(useChatStore.getState().messages["room-1"]?.[0]?.attachments[0]?.deletedAt).toBeTruthy();

    useChatStore.getState().setMessages("room-1", [msg], "cursor-1");
    useChatStore
      .getState()
      .appendMessages("room-1", [msg, { ...msg, id: "m-2", clientId: "c-2" }], "cursor-2");
    useChatStore.getState().prependMessage("room-1", { ...msg, id: "m-0", clientId: "c-0" });
    expect(selectMessages("room-1")(useChatStore.getState())).toHaveLength(3);
    expect(selectNextCursor("room-1")(useChatStore.getState())).toBe("cursor-2");

    useChatStore.getState().setOutboundQueueCount(2);
    useChatStore.getState().upsertConversation({
      ...baseConv,
      lastMessage: { ...msg, id: "opt-1", content: "Optimistic preview" },
      updatedAt: "2026-11-21T00:10:00.000Z",
    });
    useChatStore.getState().setConversations([
      {
        ...baseConv,
        lastMessage: msg,
        updatedAt: "2026-11-21T00:01:00.000Z",
      },
    ]);
    expect(useChatStore.getState().conversations["room-1"]?.lastMessage?.content).toBe(
      "Optimistic preview"
    );

    useChatStore.getState().updateConversationStatus("room-1", "CLOSED");
    useChatStore.getState().setTypingUsers("room-1", ["u-2"]);
    useChatStore.getState().setIsLoadingConversations(true);
    useChatStore.getState().setIsLoadingMessages(true);
    useChatStore.getState().setError("net error");
    useChatStore.getState().setSupportPresence({
      onlineCount: 4,
      onlineAgentCount: 4,
      isSupportOnline: true,
      agents: [],
    });
    useChatStore.getState().setQueueStatus("room-1", {
      conversationId: "room-1",
      queuePosition: 1,
      estimatedWaitMinutes: 2,
    });

    const state = useChatStore.getState();
    expect(selectConversations(state)).toHaveLength(1);
    expect(selectCurrentConversationId(state)).toBe("room-1");
    expect(selectTypingUsers("room-1")(state)).toEqual(["u-2"]);
    expect(selectIsLoadingConversations(state)).toBe(true);
    expect(selectIsLoadingMessages(state)).toBe(true);
    expect(selectChatError(state)).toBe("net error");
    expect(selectSupportPresence(state)?.onlineCount).toBe(4);
    expect(selectQueueStatus("room-1")(state)?.queuePosition).toBe(1);

    expect(selectMessages("missing")(state)).toBe(selectMessages("missing-2")(state));
    expect(selectTypingUsers("missing")(state)).toBe(selectTypingUsers("missing-2")(state));
  });
});
