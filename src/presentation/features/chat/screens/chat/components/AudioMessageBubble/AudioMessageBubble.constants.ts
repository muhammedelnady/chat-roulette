/** @format */

export const AUDIO_MESSAGE_BUBBLE_TEST_IDS = {
  ROOT: "audio-message-bubble",
  PLAY_PAUSE_BUTTON: "audio-play-pause-button",
  SPEED_BUTTON: "audio-speed-button",
  WAVEFORM_CONTAINER: "audio-waveform-container",
  WAVEFORM_BAR: (index: number) => `audio-waveform-bar-${index}`,
  CURRENT_TIME: "audio-current-time",
  TOTAL_DURATION: "audio-total-duration",
} as const;

export const DEFAULT_WAVEFORM_BARS = [0.25, 0.6, 0.85, 0.45, 0.9, 0.7, 0.5, 0.8, 0.4, 0.65, 0.3];
