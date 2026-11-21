/** @format */

import { Redirect, useLocalSearchParams } from "expo-router";

import { ListErrorBoundary } from "@/src/presentation/components/error-boundary/ListErrorBoundary";
import { ChatContent } from "@/src/presentation/features/chat";

const RESERVED_ROUTE_NAMES = new Set(["index", "roulette"]);

export default function ChatRoomScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  if (!conversationId || RESERVED_ROUTE_NAMES.has(conversationId)) {
    return <Redirect href="/rooms" />;
  }

  return (
    <ListErrorBoundary sectionName="chat room">
      <ChatContent conversationId={conversationId} testID="chat-content" />
    </ListErrorBoundary>
  );
}
