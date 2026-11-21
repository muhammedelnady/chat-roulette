/** @format */

import type { ChatConversationEntity, ChatRoomCategory } from "../../../shared/types";

export interface ChatRoomsViewModel {
  readonly rooms: readonly ChatConversationEntity[];
  readonly selectedCategory: ChatRoomCategory;
  readonly searchQuery: string;
  readonly isLoading: boolean;
  readonly isOnline: boolean;
  readonly isDark: boolean;
  readonly isRTL: boolean;
  readonly totalOnlineMembers: number;
  readonly outboundQueueCount: number;
  readonly setSelectedCategory: (category: ChatRoomCategory) => void;
  readonly setSearchQuery: (query: string) => void;
  readonly openRoom: (roomId: string) => void;
  readonly openRoulette: () => void;
  readonly toggleOfflineMode: () => void;
  readonly toggleTheme: () => void;
  readonly toggleLanguage: () => void;
  readonly refresh: () => Promise<void>;
}

export interface ChatRoomsContentProps {
  readonly testID?: string;
  readonly viewModel?: ChatRoomsViewModel;
}
