/** @format */

import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react-native";

import { UseCasesProvider } from "@/src/di/UseCasesProvider";
import { useChatStore, useConnectivityStore } from "@/src/presentation/stores";

import type { ChatConversationEntity } from "../../../shared/types";

import { ChatRoomsContent } from "./ChatRoomsContent";
import { CHAT_ROOMS_TEST_IDS } from "./ChatRoomsContent.constants";
import type { ChatRoomsViewModel } from "./ChatRoomsContent.types";
import { useChatRoomsViewModel } from "./ChatRoomsContent.viewmodel";

const sampleRoom: ChatConversationEntity = {
  id: "room-rn-architecture",
  scope: "ROOM",
  handledBy: "COMMUNITY",
  status: "OPEN",
  subject: "React Native & Expo 58 Architecture",
  topic: "Clean Architecture · DI · Reanimated 4",
  category: "TECH",
  participantCount: 42,
  unreadCount: 2,
  isRouletteMatch: false,
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  participants: [],
};

describe("ChatRoomsContent", () => {
  const createViewModel = (overrides: Partial<ChatRoomsViewModel> = {}): ChatRoomsViewModel => ({
    rooms: [sampleRoom],
    selectedCategory: "ALL",
    searchQuery: "",
    isLoading: false,
    isRefreshing: false,
    error: null,
    isOnline: true,
    isDark: true,
    isRTL: false,
    totalOnlineMembers: 168,
    outboundQueueCount: 0,
    setSelectedCategory: jest.fn(),
    setSearchQuery: jest.fn(),
    openRoom: jest.fn(),
    openRoulette: jest.fn(),
    toggleOfflineMode: jest.fn(),
    toggleTheme: jest.fn(),
    toggleLanguage: jest.fn(),
    refresh: jest.fn().mockResolvedValue(undefined),
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

  it("renders rooms, roulette hero CTA, and showcase control toggles", async () => {
    const vm = createViewModel();
    await render(<ChatRoomsContent viewModel={vm} />);

    expect(screen.getByText("React Native & Expo 58 Architecture")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("spin-roulette-cta"));
    expect(vm.openRoulette).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId("room-card-room-rn-architecture"));
    expect(vm.openRoom).toHaveBeenCalledWith("room-rn-architecture");

    await fireEvent.press(screen.getByTestId("control-network-toggle"));
    expect(vm.toggleOfflineMode).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId("control-theme-toggle"));
    expect(vm.toggleTheme).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId("control-language-toggle"));
    expect(vm.toggleLanguage).toHaveBeenCalledTimes(1);
  });

  it("renders empty state, error retry UI, and search clear button", async () => {
    const vm = createViewModel({ rooms: [] });
    const { unmount } = await render(<ChatRoomsContent viewModel={vm} />);
    expect(screen.getByTestId(CHAT_ROOMS_TEST_IDS.EMPTY_STATE)).toBeTruthy();
    await unmount();

    const refresh = jest.fn().mockResolvedValue(undefined);
    const setSearchQuery = jest.fn();
    const errVm = createViewModel({
      rooms: [],
      searchQuery: "expo",
      error: "Failed to load rooms",
      refresh,
      setSearchQuery,
    });
    await render(<ChatRoomsContent viewModel={errVm} />);
    expect(screen.getByTestId(CHAT_ROOMS_TEST_IDS.ERROR_STATE)).toBeTruthy();

    await fireEvent.press(screen.getByTestId(CHAT_ROOMS_TEST_IDS.RETRY_BUTTON));
    expect(refresh).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId(CHAT_ROOMS_TEST_IDS.CLEAR_SEARCH_BUTTON));
    expect(setSearchQuery).toHaveBeenCalledWith("");
  });

  it("renders ChatRoomsContent container and filters rooms in useChatRoomsViewModel", async () => {
    const { unmount: unmountView } = await render(<ChatRoomsContent />, {
      wrapper: UseCasesProvider,
    });

    await waitFor(() => {
      expect(screen.getByTestId("chat-rooms-content")).toBeTruthy();
    });
    await unmountView();

    const { result, unmount } = await renderHook(() => useChatRoomsViewModel(), {
      wrapper: UseCasesProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.rooms.length).toBeGreaterThan(0);

    await act(async () => {
      result.current.setSelectedCategory("TECH");
    });
    expect(result.current.rooms.every((r) => r.category === "TECH")).toBe(true);

    await act(async () => {
      result.current.setSelectedCategory("ALL");
      result.current.setSearchQuery("expo");
    });
    expect(result.current.rooms.length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.isRefreshing).toBe(false);

    await act(async () => {
      result.current.toggleOfflineMode();
    });
    expect(result.current.isOnline).toBe(false);
    await act(async () => {
      result.current.toggleOfflineMode();
    });
    expect(result.current.isOnline).toBe(true);

    await unmount();
  });
});
