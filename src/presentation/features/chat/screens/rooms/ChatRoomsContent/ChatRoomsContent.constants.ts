/** @format */

import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { TxKeyPath } from "@/src/infrastructure/i18n/types";

import type { ChatRoomCategory } from "../../../shared/types";

export const CHAT_ROOMS_TEST_IDS = {
  ROOT: "chat-rooms-content",
  LIST: "chat-rooms-list",
  SEARCH_INPUT: "chat-rooms-search-input",
  CLEAR_SEARCH_BUTTON: "chat-rooms-clear-search",
  EMPTY_STATE: "chat-rooms-empty-state",
  ERROR_STATE: "chat-rooms-error-state",
  RETRY_BUTTON: "chat-rooms-retry-button",
  LOADING_SPINNER: "chat-rooms-loading-spinner",
  CATEGORY_CHIP: (cat: ChatRoomCategory) => `category-chip-${cat}`,
} as const;

export const ROOM_CATEGORY_FILTERS: readonly {
  readonly key: ChatRoomCategory;
  readonly labelKey: TxKeyPath;
  readonly icon: ComponentProps<typeof Ionicons>["name"];
}[] = [
  { key: "ALL", labelKey: "rooms.categoryAll", icon: "grid-outline" },
  { key: "TRENDING", labelKey: "rooms.categoryTrending", icon: "flame-outline" },
  { key: "TECH", labelKey: "rooms.categoryTech", icon: "code-slash-outline" },
  { key: "DESIGN", labelKey: "rooms.categoryDesign", icon: "color-palette-outline" },
  { key: "FOUNDERS", labelKey: "rooms.categoryFounders", icon: "rocket-outline" },
  { key: "ROULETTE", labelKey: "rooms.categoryRoulette", icon: "sparkles-outline" },
];
