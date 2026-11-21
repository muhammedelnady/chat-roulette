/** @format */

import { act, fireEvent, render, renderHook, screen } from "@testing-library/react-native";

import { UseCasesProvider } from "@/src/di/UseCasesProvider";

import type { ChatConversationEntity } from "../../../shared/types";

import { ChatRouletteContent } from "./ChatRouletteContent";
import { CHAT_ROULETTE_TEST_IDS, MATCH_SCAN_DELAY_MS } from "./ChatRouletteContent.constants";
import type { ChatRouletteViewModel } from "./ChatRouletteContent.types";
import { useChatRouletteViewModel } from "./ChatRouletteContent.viewmodel";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  useFocusEffect: () => undefined,
}));

const sampleMatch: ChatConversationEntity = {
  id: "roulette-sarah",
  scope: "ROULETTE",
  handledBy: "PEER",
  status: "OPEN",
  subject: "Sarah Chen",
  topic: "React Native",
  category: "ROULETTE",
  participantCount: 2,
  isRouletteMatch: true,
  partnerRole: "Staff Mobile Architect",
  partnerLocation: "San Francisco",
  icebreaker: "What animation win are you proudest of?",
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  participants: [],
};

describe("ChatRouletteContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createViewModel = (
    overrides: Partial<ChatRouletteViewModel> = {}
  ): ChatRouletteViewModel => ({
    selectedTopic: "React Native",
    isScanning: false,
    matchedRoom: null,
    error: null,
    setSelectedTopic: jest.fn(),
    startMatching: jest.fn(),
    cancelMatching: jest.fn(),
    enterMatchedRoom: jest.fn(),
    navigateBack: jest.fn(),
    ...overrides,
  });

  it("lets user select topic and launch radar matching", async () => {
    const vm = createViewModel();
    await render(<ChatRouletteContent viewModel={vm} />);

    await fireEvent.press(screen.getByTestId("roulette-topic-ai"));
    expect(vm.setSelectedTopic).toHaveBeenCalledWith("AI Agents");

    await fireEvent.press(screen.getByTestId("roulette-start-button"));
    expect(vm.startMatching).toHaveBeenCalledTimes(1);
  });

  it("reveals matched partner card, renders error state with Retry CTA, and enters room", async () => {
    const errVm = createViewModel({ error: "Unable to find a match right now." });
    const { unmount: unmountErr } = await render(<ChatRouletteContent viewModel={errVm} />);
    expect(screen.getByTestId(CHAT_ROULETTE_TEST_IDS.ERROR_BANNER)).toBeTruthy();
    expect(screen.getByText("Retry")).toBeTruthy();
    await unmountErr();

    const vm = createViewModel({ matchedRoom: sampleMatch });
    await render(<ChatRouletteContent viewModel={vm} />);

    expect(screen.getByText("Sarah Chen")).toBeTruthy();
    await fireEvent.press(screen.getByTestId("enter-matched-room-cta"));
    expect(vm.enterMatchedRoom).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId("spin-again-cta"));
    expect(vm.startMatching).toHaveBeenCalledTimes(1);
  });

  it("handles matching lifecycle, cancel/unmount race guards, and replaceWithChat navigation", async () => {
    jest.useFakeTimers();

    const { unmount: unmountView } = await render(<ChatRouletteContent />, {
      wrapper: UseCasesProvider,
    });
    expect(screen.getByTestId("chat-roulette-content")).toBeTruthy();
    await unmountView();

    const { result, unmount } = await renderHook(() => useChatRouletteViewModel(), {
      wrapper: UseCasesProvider,
    });

    await act(async () => {
      result.current.setSelectedTopic("AI Agents");
    });
    expect(result.current.selectedTopic).toBe("AI Agents");

    await act(async () => {
      result.current.startMatching();
    });
    expect(result.current.isScanning).toBe(true);

    await act(async () => {
      result.current.cancelMatching();
      jest.advanceTimersByTime(MATCH_SCAN_DELAY_MS + 100);
      await Promise.resolve();
    });
    expect(result.current.isScanning).toBe(false);
    expect(result.current.matchedRoom).toBeNull();

    await act(async () => {
      result.current.startMatching();
    });
    await act(async () => {
      jest.advanceTimersByTime(MATCH_SCAN_DELAY_MS + 100);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.matchedRoom).not.toBeNull();
    expect(result.current.isScanning).toBe(false);
    const matchedId = result.current.matchedRoom?.id ?? "";

    await act(async () => {
      result.current.enterMatchedRoom();
    });
    expect(mockReplace).toHaveBeenCalledWith(`/rooms/${encodeURIComponent(matchedId)}`);

    await unmount();
  });
});
