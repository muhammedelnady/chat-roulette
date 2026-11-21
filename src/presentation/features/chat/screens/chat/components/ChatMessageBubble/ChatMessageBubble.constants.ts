/** @format */

export const CHAT_MESSAGE_BUBBLE_TEST_IDS = {
  ROOT: "chat-message-bubble",
  BUBBLE: "chat-message-bubble-container",
  TEXT: "chat-message-bubble-text",
  TIME: "chat-message-bubble-time",
  STATUS_TICK: "chat-message-bubble-status-tick",
  BOT_BADGE: "chat-message-bubble-bot-badge",
  DELETED_MESSAGE: "chat-message-bubble-deleted",
  DELETED_ATTACHMENT: "chat-message-bubble-deleted-attachment",
  ATTACHMENT_IMAGE: "chat-message-bubble-attachment-image",
  ATTACHMENT_FILE: "chat-message-bubble-attachment-file",
  LIGHTBOX_MODAL: "chat-message-bubble-lightbox-modal",
  LIGHTBOX_CLOSE: "chat-message-bubble-lightbox-close",
  RETRY_PRESSABLE: "chat-message-bubble-retry",
  REACTION_PILL: (emoji: string) => `chat-reaction-${emoji}`,
} as const;
