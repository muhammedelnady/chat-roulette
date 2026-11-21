/** @format */

import type { ChatConversationEntity } from "../../../../shared/types";

export interface ChatRoomContextCardProps {
  readonly conversation: ChatConversationEntity;
  readonly onSpinNext?: () => void;
  readonly testID?: string;
}
