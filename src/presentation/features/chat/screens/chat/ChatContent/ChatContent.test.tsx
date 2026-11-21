/** @format */

import { fireEvent, render, screen } from "@testing-library/react-native";

import { UseCasesProvider } from "@/src/di/UseCasesProvider";

import type { ChatConversationEntity, ChatMessageEntity } from "../../../shared/types";

import { ChatContent } from "./ChatContent";
import type { ChatViewModel } from "./ChatContent.types";

const sampleConv: ChatConversationEntity = {
  id: "room-rn-architecture",
  scope: "ROOM",
  handledBy: "COMMUNITY",
  status: "OPEN",
  subject: "React Native & Expo 58 Architecture",
  topic: "Clean Architecture · DI",
  participantCount: 42,
  icebreaker: "Ask about Clean Architecture!",
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  participants: [],
};

const sampleMsg: ChatMessageEntity = {
  id: "msg-1",
  clientId: "client-1",
  conversationId: "room-rn-architecture",
  senderType: "USER",
  content: "Testing real-time chat!",
  contentType: "text",
  status: "READ",
  isEdited: false,
  createdAt: "2026-11-21T00:00:00.000Z",
  attachments: [],
};

describe("ChatContent", () => {
  const createViewModel = (overrides: Partial<ChatViewModel> = {}): ChatViewModel => ({
    conversation: sampleConv,
    messages: [sampleMsg],
    inputText: "Hello",
    stagedAttachments: [],
    typingUsers: [],
    isLoading: false,
    isSending: false,
    isError: false,
    error: null,
    isClosed: false,
    supportPresence: null,
    queueStatus: null,
    headerSubtitle: "Live · 42 active",
    isNetworkOnline: true,
    outboundQueueCount: 0,
    setInputText: jest.fn(),
    sendMessage: jest.fn(),
    handleRetryMessage: jest.fn(),
    sendAudioNote: jest.fn().mockResolvedValue(undefined),
    pickAttachment: jest.fn().mockResolvedValue(undefined),
    removeStagedAttachment: jest.fn(),
    deleteAttachment: jest.fn().mockResolvedValue(undefined),
    toggleReaction: jest.fn(),
    toggleOfflineMode: jest.fn(),
    spinNextMatch: jest.fn(),
    loadMore: jest.fn(),
    refresh: jest.fn().mockResolvedValue(undefined),
    navigateBack: jest.fn(),
    ...overrides,
  });

  it("renders messages, context card, and triggers send/navigation actions", async () => {
    const vm = createViewModel();
    await render(<ChatContent viewModel={vm} />, { wrapper: UseCasesProvider });

    expect(screen.getByText("Testing real-time chat!")).toBeTruthy();
    expect(screen.getByTestId("chat-room-context-card")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("chat-send-button"));
    expect(vm.sendMessage).toHaveBeenCalledWith("Hello");

    await fireEvent.press(screen.getByTestId("chat-header-network-toggle"));
    expect(vm.toggleOfflineMode).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId("chat-room-context-card-cta"));
    expect(vm.spinNextMatch).toHaveBeenCalledTimes(1);
  });

  it("renders offline outbox banner when offline with queued messages", async () => {
    const vm = createViewModel({ isNetworkOnline: false, outboundQueueCount: 2 });
    await render(<ChatContent viewModel={vm} />, { wrapper: UseCasesProvider });
    expect(screen.getByTestId("queue-status-banner")).toBeTruthy();
  });
});
