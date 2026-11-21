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
  it("renders message text, sender name, and triggers reaction toggle", async () => {
    const onToggleReaction = jest.fn();
    await render(<ChatMessageBubble message={baseMessage} onToggleReaction={onToggleReaction} />);

    expect(screen.getByText("Sarah Chen")).toBeTruthy();
    expect(screen.getByText("Welcome to Chat Roulette!")).toBeTruthy();

    await fireEvent.press(screen.getByTestId(CHAT_MESSAGE_BUBBLE_TEST_IDS.REACTION_PILL("⚡")));
    expect(onToggleReaction).toHaveBeenCalledWith("m-1", "⚡");
  });

  it("supports retry action on failed outbound messages", async () => {
    const onRetry = jest.fn();
    await render(
      <ChatMessageBubble
        message={{ ...baseMessage, senderType: "USER", status: "FAILED" }}
        isOwn
        onRetryMessage={onRetry}
      />
    );

    await fireEvent.press(screen.getByTestId(CHAT_MESSAGE_BUBBLE_TEST_IDS.RETRY_PRESSABLE));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
