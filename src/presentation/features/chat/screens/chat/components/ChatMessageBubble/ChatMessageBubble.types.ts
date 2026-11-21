/** @format */

import type { ChatMessageEntity } from "../../../../shared/types";

export interface ChatMessageBubbleProps {
  readonly message: ChatMessageEntity;
  readonly isOwn?: boolean;
  readonly isFirstInGroup?: boolean;
  readonly isLastInGroup?: boolean;
  readonly onDeleteAttachment?: (attachmentId: string, messageId: string) => void;
  readonly onSelectFaqOption?: (query: string) => void;
  readonly onRetryMessage?: (message: ChatMessageEntity) => void;
  readonly onToggleReaction?: (messageId: string, emoji: string) => void;
  readonly testID?: string;
}
