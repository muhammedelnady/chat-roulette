/** @format */

import type { ChatConversationEntity } from "../../../../shared/types";

export interface MatchRevealCardProps {
  readonly match: ChatConversationEntity;
  readonly onEnterRoom: () => void;
  readonly onSpinAgain: () => void;
  readonly testID?: string;
}
