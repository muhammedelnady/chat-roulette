/** @format */

import { act, fireEvent, render, screen, within } from "@testing-library/react-native";
import * as Audio from "expo-audio";

import { AudioMessageBubble } from "./AudioMessageBubble";
import { AUDIO_MESSAGE_BUBBLE_TEST_IDS } from "./AudioMessageBubble.constants";

describe("AudioMessageBubble", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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

  it("lazily initializes native expo-audio player on demand and replays with seekTo(0)", async () => {
    jest.useFakeTimers();
    const mockPlayer = {
      play: jest.fn(),
      pause: jest.fn(),
      seekTo: jest.fn().mockResolvedValue(undefined),
      setPlaybackRate: jest.fn(),
      playing: false,
      currentTime: 0,
      duration: 1,
    };
    (Audio.useAudioPlayer as jest.Mock).mockReturnValue(mockPlayer);

    await render(
      <AudioMessageBubble
        audioUrl="https://cdn.example.com/voice.m4a"
        durationSeconds={1}
        waveformBars={[0.3, 0.6, 0.9, 0.5]}
      />
    );

    expect(Audio.useAudioPlayer).toHaveBeenCalledWith(null);

    const playPauseButton = screen.getByTestId(AUDIO_MESSAGE_BUBBLE_TEST_IDS.PLAY_PAUSE_BUTTON);
    await fireEvent.press(playPauseButton);

    expect(Audio.useAudioPlayer).toHaveBeenLastCalledWith("https://cdn.example.com/voice.m4a");
    expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(1);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByTestId(AUDIO_MESSAGE_BUBBLE_TEST_IDS.SPEED_BUTTON));
    expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(1.5);

    await fireEvent.press(screen.getByTestId(AUDIO_MESSAGE_BUBBLE_TEST_IDS.WAVEFORM_BAR(2)));
    expect(mockPlayer.seekTo).toHaveBeenCalledWith(0.5);

    await act(async () => {
      jest.advanceTimersByTime(1100);
    });
    expect(mockPlayer.pause).toHaveBeenCalled();

    await fireEvent.press(playPauseButton);
    expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(mockPlayer.play).toHaveBeenCalledTimes(2);
  });

  it("enforces mutual exclusion so playing a second bubble pauses the active one", async () => {
    await render(
      <>
        <AudioMessageBubble audioUrl="simulated://a.m4a" durationSeconds={6} testID="bubble-a" />
        <AudioMessageBubble audioUrl="simulated://b.m4a" durationSeconds={6} testID="bubble-b" />
      </>
    );

    const btnA = within(screen.getByTestId("bubble-a")).getByTestId(
      AUDIO_MESSAGE_BUBBLE_TEST_IDS.PLAY_PAUSE_BUTTON
    );
    const btnB = within(screen.getByTestId("bubble-b")).getByTestId(
      AUDIO_MESSAGE_BUBBLE_TEST_IDS.PLAY_PAUSE_BUTTON
    );

    await fireEvent.press(btnA);
    expect(btnA.props["accessibilityLabel"]).toBe("Pause voice note");

    await fireEvent.press(btnB);
    expect(btnA.props["accessibilityLabel"]).toBe("Play voice note");
    expect(btnB.props["accessibilityLabel"]).toBe("Pause voice note");
  });
});
