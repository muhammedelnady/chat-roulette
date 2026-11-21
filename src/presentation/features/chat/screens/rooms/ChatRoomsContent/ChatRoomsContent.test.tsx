/** @format */

import { fireEvent, render, screen } from "@testing-library/react-native";

import type { ChatConversationEntity } from "../../../shared/types";

import { ChatRoomsContent } from "./ChatRoomsContent";
import type { ChatRoomsViewModel } from "./ChatRoomsContent.types";

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

  it("renders empty state when filtered rooms list is empty", async () => {
    const vm = createViewModel({ rooms: [] });
    await render(<ChatRoomsContent viewModel={vm} />);
    expect(screen.getByTestId("chat-rooms-empty-state")).toBeTruthy();
  });
});
