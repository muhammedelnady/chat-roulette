/** @format */

import { mapConversationDtoToEntity, mapMessageDtoToEntity } from "./ChatMapper";

describe("ChatMapper", () => {
  it("maps ConversationDto and MessageDto to domain entities safely", () => {
    const msg = mapMessageDtoToEntity({
      id: "m-1",
      clientId: "c-1",
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
      ],
    });
    expect(msg.id).toBe("m-1");
    expect(msg.attachments[0]?.id).toBe("up-1");

    const conv = mapConversationDtoToEntity({
      id: "conv-1",
      scope: "ROULETTE",
      handledBy: "PEER",
      subject: "Sarah Chen",
      category: "ROULETTE",
      isRouletteMatch: true,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:00:00.000Z",
      messages: [
        {
          id: "m-1",
          clientId: "c-1",
          conversationId: "conv-1",
          senderType: "UNKNOWN_TYPE",
          contentType: "text",
          isEdited: false,
          createdAt: "2026-11-21T00:00:00.000Z",
        },
      ],
    });

    expect(conv.scope).toBe("ROULETTE");
    expect(conv.lastMessage?.senderType).toBe("USER");
  });
});
