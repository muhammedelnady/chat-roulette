/** @format */

import type { TxKeyPath } from "@/src/infrastructure/i18n/types";

import type { ChatRoomCategory } from "../../../shared/types";

export const CHAT_ROOMS_TEST_IDS = {
  ROOT: "chat-rooms-content",
  LIST: "chat-rooms-list",
  SEARCH_INPUT: "chat-rooms-search-input",
  EMPTY_STATE: "chat-rooms-empty-state",
  LOADING_SPINNER: "chat-rooms-loading-spinner",
  CATEGORY_CHIP: (cat: ChatRoomCategory) => `category-chip-${cat}`,
} as const;

export const ROOM_CATEGORY_FILTERS: readonly {
  readonly key: ChatRoomCategory;
  readonly labelKey: TxKeyPath;
}[] = [
  { key: "ALL", labelKey: "rooms.categoryAll" },
  { key: "TRENDING", labelKey: "rooms.categoryTrending" },
  { key: "TECH", labelKey: "rooms.categoryTech" },
  { key: "DESIGN", labelKey: "rooms.categoryDesign" },
  { key: "FOUNDERS", labelKey: "rooms.categoryFounders" },
  { key: "ROULETTE", labelKey: "rooms.categoryRoulette" },
];
