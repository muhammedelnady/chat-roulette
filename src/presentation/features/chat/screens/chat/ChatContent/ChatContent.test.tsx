/** @format */

import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react-native";
import { AppState } from "react-native";

import { UseCasesProvider } from "@/src/di/UseCasesProvider";
import type { IChatSocketService } from "@/src/domain/services";
import { useChatStore, useConnectivityStore } from "@/src/presentation/stores";

import type { ChatConversationEntity, ChatMessageEntity } from "../../../shared/types";

import { ChatContent } from "./ChatContent";
import type { ChatViewModel } from "./ChatContent.types";
import { useChatViewModel } from "./ChatContent.viewmodel";
import { useChatInput } from "./hooks/useChatInput";
import { bindChatSocketEvents } from "./hooks/useChatSocketHandlers";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [
      {
        uri: "file:///pic.jpg",
        fileName: "pic.jpg",
        mimeType: "image/jpeg",
        fileSize: 1024,
      },
    ],
  }),
}));

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

  beforeEach(() => {
    useChatStore.getState().reset();
    useConnectivityStore.setState({
      isConnected: true,
      isInternetReachable: true,
      demoOfflineOverride: false,
    });
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

  it("renders closed banner, disables input when closed, and renders retryable error state", async () => {
    const closedVm = createViewModel({ isClosed: true });
    const { unmount: unmountClosed } = await render(<ChatContent viewModel={closedVm} />, {
      wrapper: UseCasesProvider,
    });
    expect(screen.getByTestId("chat-closed-bar")).toBeTruthy();
    await fireEvent.press(screen.getByTestId("chat-send-button"));
    expect(closedVm.sendMessage).not.toHaveBeenCalled();
    await unmountClosed();

    const refresh = jest.fn().mockResolvedValue(undefined);
    const errVm = createViewModel({
      messages: [],
      isError: true,
      error: "Connection dropped",
      refresh,
    });
    await render(<ChatContent viewModel={errVm} />, { wrapper: UseCasesProvider });
    expect(screen.getByText("Failed to load room")).toBeTruthy();
    await fireEvent.press(screen.getByText("Retry"));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("groups multi-peer messages by distinct sender identity", async () => {
    const sarahMsg: ChatMessageEntity = {
      ...sampleMsg,
      id: "m-sarah",
      clientId: "c-sarah",
      senderType: "SUPPORT_AGENT",
      senderId: "sarah",
      senderName: "Sarah Chen",
      content: "Sarah here",
    };
    const marcusMsg: ChatMessageEntity = {
      ...sampleMsg,
      id: "m-marcus",
      clientId: "c-marcus",
      senderType: "SUPPORT_AGENT",
      senderId: "marcus",
      senderName: "Marcus Vance",
      content: "Marcus here",
    };
    const vm = createViewModel({ messages: [marcusMsg, sarahMsg] });
    await render(<ChatContent viewModel={vm} />, { wrapper: UseCasesProvider });

    expect(screen.getByText("Sarah Chen")).toBeTruthy();
    expect(screen.getByText("Marcus Vance")).toBeTruthy();
  });

  it("renders offline outbox banner when offline with queued messages", async () => {
    const vm = createViewModel({ isNetworkOnline: false, outboundQueueCount: 2 });
    await render(<ChatContent viewModel={vm} />, { wrapper: UseCasesProvider });
    expect(screen.getByTestId("queue-status-banner")).toBeTruthy();
  });

  it("renders staged attachments tray and audio recording tray in ChatInputBar", async () => {
    const vm = createViewModel({
      inputText: "",
      stagedAttachments: [
        {
          localId: "local-a",
          uri: "file:///a.jpg",
          name: "a.jpg",
          type: "image/jpeg",
          size: 100,
          isUploading: false,
        },
        {
          localId: "local-b",
          uri: "file:///b.jpg",
          name: "b.jpg",
          type: "image/jpeg",
          size: 100,
          isUploading: true,
        },
      ],
    });
    const { unmount: unmountTray } = await render(<ChatContent viewModel={vm} />, {
      wrapper: UseCasesProvider,
    });
    expect(screen.getByTestId("chat-staging-tray")).toBeTruthy();
    expect(screen.getByTestId("chat-uploading-spinner")).toBeTruthy();
    const dismissBtns = screen.getAllByTestId("chat-dismiss-attachment");
    const firstDismissBtn = dismissBtns[0];
    expect(firstDismissBtn).toBeTruthy();
    if (firstDismissBtn) {
      await fireEvent.press(firstDismissBtn);
    }
    expect(vm.removeStagedAttachment).toHaveBeenCalledWith("local-a");
    await unmountTray();

    const recVm = createViewModel({ inputText: "" });
    const { unmount: unmountRec } = await render(<ChatContent viewModel={recVm} />, {
      wrapper: UseCasesProvider,
    });
    await fireEvent.press(screen.getByTestId("chat-record-button"));
    await waitFor(() => {
      expect(screen.getByTestId("chat-recording-tray")).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId("chat-cancel-recording"));
    await waitFor(() => {
      expect(screen.queryByTestId("chat-recording-tray")).toBeNull();
    });
    await unmountRec();
  });

  it("renders ChatContent container and executes useChatViewModel flows", async () => {
    const { unmount: unmountView } = await render(
      <ChatContent conversationId="room-rn-architecture" />,
      { wrapper: UseCasesProvider }
    );

    await waitFor(() => {
      expect(screen.getByTestId("chat-content")).toBeTruthy();
    });
    await unmountView();

    const { result, unmount } = await renderHook(() => useChatViewModel("room-rn-architecture"), {
      wrapper: UseCasesProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.setInputText("Hello Clean Arch");
    });
    expect(result.current.inputText).toBe("Hello Clean Arch");

    await act(async () => {
      await result.current.sendMessage("Testing architecture");
    });
    expect(result.current.inputText).toBe("");
    expect(result.current.messages.some((m) => m.content === "Testing architecture")).toBe(true);

    const sentMsg = result.current.messages.find((m) => m.content === "Testing architecture");
    if (sentMsg) {
      await act(async () => {
        await result.current.handleRetryMessage(sentMsg);
        await result.current.toggleReaction(sentMsg.id, "🔥");
        await result.current.deleteAttachment("att-1", sentMsg.id);
      });
    }

    await act(async () => {
      await result.current.sendAudioNote({ uri: "file:///note.m4a", duration: 3 });
    });
    expect(result.current.messages.some((m) => m.contentType === "AUDIO")).toBe(true);

    await act(async () => {
      result.current.toggleOfflineMode();
    });
    expect(result.current.isNetworkOnline).toBe(false);
    await act(async () => {
      result.current.toggleOfflineMode();
    });
    expect(result.current.isNetworkOnline).toBe(true);

    await act(async () => {
      await result.current.pickAttachment();
    });
    expect(result.current.stagedAttachments.length).toBe(1);

    await act(async () => {
      await result.current.sendMessage("With photo");
    });
    expect(result.current.stagedAttachments.length).toBe(0);

    await act(async () => {
      result.current.removeStagedAttachment("file:///unused.jpg");
      result.current.loadMore();
    });

    await unmount();
  });

  it("binds and unbinds chat socket handlers safely with payload guards", () => {
    const listeners = new Map<string, (...args: unknown[]) => void>();
    const mockSocket: IChatSocketService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      isConnected: () => true,
      joinConversation: jest.fn(),
      leaveConversation: jest.fn(),
      sendMessage: jest.fn(),
      startTyping: jest.fn(),
      stopTyping: jest.fn(),
      markMessageRead: jest.fn(),
      deleteAttachment: jest.fn(),
      onEvent: jest.fn((event, handler) => {
        listeners.set(event, handler);
      }),
      offEvent: jest.fn(),
    };

    const actions = {
      upsertMessage: jest.fn(),
      updateMessageStatus: jest.fn(),
      setTypingUsers: jest.fn(),
      markMessagesRead: jest.fn(),
      removeAttachment: jest.fn(),
      setQueueStatus: jest.fn(),
      setOutboundQueueCount: jest.fn(),
      setSupportPresence: jest.fn(),
    };
    const onReconnect = jest.fn();

    const unbind = bindChatSocketEvents("room-1", mockSocket, actions, onReconnect);

    const prevAppState = AppState.currentState;
    AppState.currentState = "active";
    try {
      listeners.get("message:new")?.(null);
      listeners.get("message:new")?.({
        conversationId: "room-1",
        message: {
          id: "m-new",
          clientId: "c-new",
          conversationId: "room-1",
          senderType: "SUPPORT_AGENT",
          content: "Hi",
          contentType: "text",
          isEdited: false,
          createdAt: "2026-11-21T00:00:00.000Z",
          attachments: [],
        },
      });
      expect(actions.upsertMessage).toHaveBeenCalledTimes(1);
      expect(mockSocket.markMessageRead).toHaveBeenCalledWith("room-1", "m-new");
    } finally {
      AppState.currentState = prevAppState;
    }

    listeners.get("message:delivered")?.("invalid");
    listeners.get("message:delivered")?.({ clientId: "c-new" });
    expect(actions.updateMessageStatus).toHaveBeenCalledWith("room-1", "c-new", "DELIVERED");

    listeners.get("message:failed")?.({ clientId: "c-fail" });
    expect(actions.updateMessageStatus).toHaveBeenCalledWith("room-1", "c-fail", "FAILED");

    listeners.get("typing:update")?.({ conversationId: "room-1", userIds: ["bot", 123] });
    expect(actions.setTypingUsers).toHaveBeenCalledWith("room-1", ["bot"]);

    listeners.get("message:read")?.({
      conversationId: "room-1",
      messageId: "m-new",
      readByUserId: "u-2",
    });
    expect(actions.markMessagesRead).toHaveBeenCalledTimes(1);

    listeners.get("attachment:deleted")?.({
      conversationId: "room-1",
      messageId: "m-new",
      attachmentId: "att-1",
    });
    expect(actions.removeAttachment).toHaveBeenCalledWith("room-1", "m-new", "att-1");

    listeners.get("conversation:queue_status")?.({
      conversationId: "room-1",
      queuePosition: 1,
      estimatedWaitMinutes: 2,
    });
    expect(actions.setQueueStatus).toHaveBeenCalledTimes(1);

    listeners.get("queue:updated")?.({ count: 3 });
    expect(actions.setOutboundQueueCount).toHaveBeenCalledWith(3);

    listeners.get("support:presence")?.({ onlineCount: 5, agents: [] });
    expect(actions.setSupportPresence).toHaveBeenCalledWith(
      expect.objectContaining({ onlineCount: 5, isSupportOnline: true })
    );

    unbind();
    expect(mockSocket.offEvent).toHaveBeenCalledTimes(11);
  });

  it("manages typing state and cleans up timer on unmount in useChatInput", async () => {
    const { result, unmount } = await renderHook(() => useChatInput("room-1"), {
      wrapper: UseCasesProvider,
    });

    await act(async () => {
      result.current.setInputText("Typing...");
    });
    expect(result.current.inputText).toBe("Typing...");
    expect(result.current.isTypingRef.current).toBe(true);

    await act(async () => {
      result.current.setInputText("");
    });
    expect(result.current.isTypingRef.current).toBe(false);

    await act(async () => {
      result.current.setInputText("Again");
    });
    expect(result.current.isTypingRef.current).toBe(true);

    await unmount();
    expect(result.current.isTypingRef.current).toBe(false);
  });
});
