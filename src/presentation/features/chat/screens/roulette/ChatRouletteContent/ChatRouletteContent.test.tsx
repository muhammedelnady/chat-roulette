/** @format */

import { fireEvent, render, screen } from "@testing-library/react-native";

import type { ChatConversationEntity } from "../../../shared/types";

import { ChatRouletteContent } from "./ChatRouletteContent";
import type { ChatRouletteViewModel } from "./ChatRouletteContent.types";

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
  const createViewModel = (
    overrides: Partial<ChatRouletteViewModel> = {}
  ): ChatRouletteViewModel => ({
    selectedTopic: "React Native",
    isScanning: false,
    matchedRoom: null,
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

  it("reveals matched partner card and enters room", async () => {
    const vm = createViewModel({ matchedRoom: sampleMatch });
    await render(<ChatRouletteContent viewModel={vm} />);

    expect(screen.getByText("Sarah Chen")).toBeTruthy();
    await fireEvent.press(screen.getByTestId("enter-matched-room-cta"));
    expect(vm.enterMatchedRoom).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId("spin-again-cta"));
    expect(vm.startMatching).toHaveBeenCalledTimes(1);
  });
});
