/** @format */

export const CHAT_CONSTANTS = {
  MAX_INPUT_LENGTH: 2000,
  TYPING_DEBOUNCE_MS: 3000,
  DEFAULT_CONVERSATION_ID: "room-rn-architecture",
  ATTACHMENT_MAX_COUNT: 5,
  REACTION_EMOJIS: ["⚡", "🔥", "🚀", "💜"] as const,
} as const;

export const CHAT_TEST_IDS = {
  ROOT: "chat-content",
  FLASH_LIST: "chat-flash-list",
  HEADER: "chat-header",
  INPUT_BAR: "chat-input-bar",
  EMPTY_STATE: "chat-empty-state",
  TYPING_INDICATOR: "chat-typing-indicator",
} as const;
