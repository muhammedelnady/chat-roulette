/** @format */

export interface AudioMessageBubbleProps {
  readonly audioUrl: string;
  readonly durationSeconds?: number;
  readonly waveformBars?: readonly number[];
  readonly isOwn?: boolean;
  readonly testID?: string;
}
