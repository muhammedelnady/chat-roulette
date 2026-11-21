/** @format */

import { fireEvent, render, screen } from "@testing-library/react-native";

import { AudioMessageBubble } from "./AudioMessageBubble";
import { AUDIO_MESSAGE_BUBBLE_TEST_IDS } from "./AudioMessageBubble.constants";

describe("AudioMessageBubble", () => {
  it("toggles play/pause, cycles playback speed, and scrubs waveform", async () => {
    await render(
      <AudioMessageBubble
        audioUrl="simulated://voice.m4a"
        durationSeconds={8}
        waveformBars={[0.2, 0.5, 0.8, 0.6]}
        isOwn
      />
    );

    expect(screen.getByTestId(AUDIO_MESSAGE_BUBBLE_TEST_IDS.TOTAL_DURATION)).toHaveTextContent(
      "0:08"
    );

    const playPauseButton = screen.getByTestId(AUDIO_MESSAGE_BUBBLE_TEST_IDS.PLAY_PAUSE_BUTTON);
    await fireEvent.press(playPauseButton);
    const speedBtn = screen.getByTestId(AUDIO_MESSAGE_BUBBLE_TEST_IDS.SPEED_BUTTON);
    expect(screen.getByText("1x")).toBeTruthy();
    await fireEvent.press(speedBtn);
    expect(screen.getByText("1.5x")).toBeTruthy();
    await fireEvent.press(speedBtn);
    expect(screen.getByText("2x")).toBeTruthy();

    await fireEvent.press(screen.getByTestId(AUDIO_MESSAGE_BUBBLE_TEST_IDS.WAVEFORM_BAR(2)));
    expect(screen.getByTestId(AUDIO_MESSAGE_BUBBLE_TEST_IDS.CURRENT_TIME)).toHaveTextContent(
      "0:04"
    );

    await fireEvent.press(playPauseButton);
  });
});
