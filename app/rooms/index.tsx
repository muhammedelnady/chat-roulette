/** @format */

import { ListErrorBoundary } from "@/src/presentation/components/error-boundary/ListErrorBoundary";
import { ChatRoomsContent } from "@/src/presentation/features/chat";

export default function ChatRoomsScreen() {
  return (
    <ListErrorBoundary sectionName="rooms">
      <ChatRoomsContent testID="chat-rooms-content" />
    </ListErrorBoundary>
  );
}
