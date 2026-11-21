/** @format */

import { mapConversationDtoToEntity, mapMessageDtoToEntity } from "./ChatMapper";

describe("ChatMapper", () => {
  it("maps ConversationDto and MessageDto safely, picking latest message and validating fields", () => {
    const msg = mapMessageDtoToEntity({
      id: "m-1",
      clientId: "",
      conversationId: "conv-1",
      senderType: "USER",
      content: "Hello",
      contentType: "text",
      isEdited: false,
      createdAt: "2026-11-21T00:00:00.000Z",
      attachments: [
        {
          uploadId: "up-1",
          url: "https://example.com/pic.png",
          mimeType: "image/png",
          fileName: "pic.png",
          fileSize: 2048,
        },
        {
          url: "",
          mimeType: "image/png",
          fileName: "broken.png",
          fileSize: 10,
        },
      ],
    });
    expect(msg.id).toBe("m-1");
    expect(msg.clientId).toBe("m-1");
    expect(msg.attachments).toHaveLength(1);
    expect(msg.attachments[0]?.id).toBe("up-1");

    const conv = mapConversationDtoToEntity({
      id: "conv-1",
      scope: "ROULETTE",
      handledBy: "PEER",
      subject: "Sarah Chen",
      category: "INVALID_CAT" as unknown as "ROULETTE",
      isRouletteMatch: true,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:02:00.000Z",
      messages: [
        {
          id: "m-old",
          clientId: "c-old",
          conversationId: "conv-1",
          senderType: "UNKNOWN_TYPE",
          content: "First",
          contentType: "text",
          isEdited: false,
          createdAt: "2026-11-21T00:01:00.000Z",
        },
        {
          id: "m-new",
          clientId: "c-new",
          conversationId: "conv-1",
          senderType: "SUPPORT_AGENT",
          content: "Latest",
          contentType: "text",
          isEdited: false,
          createdAt: "2026-11-21T00:02:00.000Z",
        },
      ],
    });

    expect(conv.scope).toBe("ROULETTE");
    expect(conv.category).toBeUndefined();
    expect(conv.lastMessage?.id).toBe("m-new");
  });
});
