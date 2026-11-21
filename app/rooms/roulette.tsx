/** @format */

import { ListErrorBoundary } from "@/src/presentation/components/error-boundary/ListErrorBoundary";
import { ChatRouletteContent } from "@/src/presentation/features/chat";

export default function ChatRouletteScreen() {
  return (
    <ListErrorBoundary sectionName="roulette">
      <ChatRouletteContent testID="chat-roulette-content" />
    </ListErrorBoundary>
  );
}
