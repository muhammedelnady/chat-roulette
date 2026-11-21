/** @format */

import { fireEvent, render, screen } from "@testing-library/react-native";

import type { ChatMessageEntity } from "../../../../shared/types";

import { ChatMessageBubble } from "./ChatMessageBubble";
import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";

const baseMessage: ChatMessageEntity = {
  id: "m-1",
  clientId: "c-1",
  conversationId: "room-1",
  senderType: "SUPPORT_AGENT",
  senderName: "Sarah Chen",
  content: "Welcome to Chat Roulette!",
  contentType: "text",
  status: "DELIVERED",
  isEdited: false,
  createdAt: "2026-11-21T10:30:00.000Z",
  attachments: [],
  reactions: { "⚡": ["sarah"] },
};

describe("ChatMessageBubble", () => {
  it("renders message text, sender name, and triggers reaction picker and toggle", async () => {
    const onToggleReaction = jest.fn();
    await render(<ChatMessageBubble message={baseMessage} onToggleReaction={onToggleReaction} />);

    expect(screen.getByText("Sarah Chen")).toBeTruthy();
    expect(screen.getByText("Welcome to Chat Roulette!")).toBeTruthy();

    await fireEvent(screen.getByTestId(CHAT_MESSAGE_BUBBLE_TEST_IDS.BUBBLE), "longPress");
    expect(screen.getByLabelText("React with 🔥")).toBeTruthy();

    await fireEvent.press(screen.getByTestId(CHAT_MESSAGE_BUBBLE_TEST_IDS.REACTION_PILL("⚡")));
    expect(onToggleReaction).toHaveBeenCalledWith("m-1", "⚡");
  });

  it("supports retry action on failed outbound messages and image lightbox callback", async () => {
    const onRetry = jest.fn();
    const onPreviewImage = jest.fn();
    await render(
      <ChatMessageBubble
        message={{
          ...baseMessage,
          senderType: "USER",
          status: "FAILED",
          attachments: [
            {
              id: "att-1",
              url: "https://cdn.example.com/photo.jpg",
              mimeType: "image/jpeg",
              fileName: "photo.jpg",
              fileSize: 2048,
            },
          ],
        }}
        isOwn
        onRetryMessage={onRetry}
        onPreviewImage={onPreviewImage}
      />
    );

    await fireEvent.press(screen.getByTestId(CHAT_MESSAGE_BUBBLE_TEST_IDS.ATTACHMENT_IMAGE));
    expect(onPreviewImage).toHaveBeenCalledWith("https://cdn.example.com/photo.jpg");

    await fireEvent.press(screen.getByTestId(CHAT_MESSAGE_BUBBLE_TEST_IDS.RETRY_PRESSABLE));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("safely renders Unicode emoji sender initials without surrogate corruption", async () => {
    await render(
      <ChatMessageBubble
        message={{
          ...baseMessage,
          senderName: "🚀 Launch Bot",
        }}
      />
    );
    expect(screen.getByText("🚀")).toBeTruthy();
  });
});
