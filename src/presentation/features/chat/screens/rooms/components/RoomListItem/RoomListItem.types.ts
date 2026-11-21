/** @format */

import type { ChatConversationEntity } from "../../../../shared/types";

export interface RoomListItemProps {
  readonly room: ChatConversationEntity;
  readonly onPress: (roomId: string) => void;
  readonly testID?: string;
}
