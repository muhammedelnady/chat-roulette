/** @format */

import type { ChatConversationEntity } from "../../../shared/types";

export interface ChatRouletteViewModel {
  readonly selectedTopic: string;
  readonly isScanning: boolean;
  readonly matchedRoom: ChatConversationEntity | null;
  readonly error: string | null;
  readonly setSelectedTopic: (topic: string) => void;
  readonly startMatching: () => void;
  readonly cancelMatching: () => void;
  readonly enterMatchedRoom: () => void;
  readonly navigateBack: () => void;
}

export interface ChatRouletteContentProps {
  readonly testID?: string;
  readonly viewModel?: ChatRouletteViewModel;
}
