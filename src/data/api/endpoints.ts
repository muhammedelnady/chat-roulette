/** @format */

export const CONVERSATIONS_API = "/api/v1/chat/conversations";
export const CONVERSATION_BY_ID_API = "/api/v1/chat/conversations/:id";
export const CONVERSATION_CLOSE_API = "/api/v1/chat/conversations/:id/close";
export const ROULETTE_MATCH_API = "/api/v1/chat/roulette/match";
export const MESSAGES_API = "/api/v1/chat/conversations/:conversationId/messages";
export const MESSAGE_SEND_API = "/api/v1/chat/conversations/:conversationId/messages";
export const MESSAGE_REACTION_API =
  "/api/v1/chat/conversations/:conversationId/messages/:messageId/reactions";
export const CHAT_UPLOAD_API = "/api/v1/chat/upload";
export const CHAT_UPLOAD_AUDIO_API = "/api/v1/chat/upload/audio";
export const CHAT_ATTACHMENT_DELETE_API = "/api/v1/chat/attachments/:attachmentId";
