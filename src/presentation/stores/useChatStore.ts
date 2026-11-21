/** @format */

import { devtools } from "@csark0812/zustand-expo-devtools";
import { create } from "zustand";

import type { ConversationEntity, MessageEntity } from "@/src/domain/entities";

import type { ChatState } from "./useChatStore.types";
import {
  applyMessageReadInList,
  deduplicateMessages,
  mergeInitialMessages,
  toggleReactionInList,
  upsertMessageInList,
} from "./utils/chatStoreHelpers";
import { devtoolsConfig } from "./utils/devtools";

export type { ChatState };

const EMPTY_MESSAGES: MessageEntity[] = [];
const EMPTY_TYPING_USERS: string[] = [];

const initialState = {
  conversations: {},
  currentConversationId: null,
  messages: {},
  nextCursors: {},
  typingUsers: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,
  supportPresence: null,
  queueStatuses: {},
  outboundQueueCount: 0,
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      ...initialState,

      setConversations: (conversations) =>
        set(
          (state) => {
            const nextMap: Record<string, ConversationEntity> = {};
            for (const c of conversations) {
              const prev = state.conversations[c.id];
              const prevTs = prev ? Date.parse(prev.updatedAt) || 0 : 0;
              const nextTs = Date.parse(c.updatedAt) || 0;
              if (state.outboundQueueCount > 0 && prev?.lastMessage && prevTs > nextTs) {
                nextMap[c.id] = {
                  ...c,
                  lastMessage: prev.lastMessage,
                  updatedAt: prev.updatedAt,
                };
              } else {
                nextMap[c.id] = c;
              }
            }
            return { conversations: nextMap };
          },
          false,
          "setConversations"
        ),
      appendConversations: (conversations) =>
        set(
          (state) => {
            const next = { ...state.conversations };
            for (const c of conversations) next[c.id] = c;
            return { conversations: next };
          },
          false,
          "appendConversations"
        ),
      upsertConversation: (conversation) =>
        set(
          (state) => ({
            conversations: { ...state.conversations, [conversation.id]: conversation },
          }),
          false,
          "upsertConversation"
        ),
      setCurrentConversationId: (id) =>
        set({ currentConversationId: id }, false, "setCurrentConversationId"),
      setMessages: (conversationId, newMessages, nextCursor) =>
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [conversationId]: mergeInitialMessages(
                state.messages[conversationId] ?? [],
                newMessages
              ),
            },
            nextCursors: { ...state.nextCursors, [conversationId]: nextCursor },
          }),
          false,
          "setMessages"
        ),
      appendMessages: (conversationId, newMessages, nextCursor) =>
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [conversationId]: deduplicateMessages(
                state.messages[conversationId] ?? [],
                newMessages
              ),
            },
            nextCursors: { ...state.nextCursors, [conversationId]: nextCursor },
          }),
          false,
          "appendMessages"
        ),
      prependMessage: (conversationId, message) =>
        set(
          (state) => {
            const existing = state.messages[conversationId] ?? [];
            const { messages: next } = upsertMessageInList(existing, message);
            return { messages: { ...state.messages, [conversationId]: next } };
          },
          false,
          "prependMessage"
        ),
      upsertMessage: (conversationId, message) =>
        set(
          (state) => {
            const existing = state.messages[conversationId] ?? [];
            const { messages: next, inserted } = upsertMessageInList(existing, message);
            const existingConv = state.conversations[conversationId];
            const conversations =
              inserted && existingConv
                ? {
                    ...state.conversations,
                    [conversationId]: {
                      ...existingConv,
                      lastMessage: message,
                      updatedAt: message.createdAt,
                    },
                  }
                : state.conversations;
            return {
              conversations,
              messages: { ...state.messages, [conversationId]: next },
            };
          },
          false,
          "upsertMessage"
        ),
      updateMessageStatus: (conversationId, clientIdOrId, status) =>
        set(
          (state) => {
            const existing = state.messages[conversationId];
            if (!existing || existing.length === 0) return state;
            const hasMatch = existing.some(
              (m) => m.clientId === clientIdOrId || m.id === clientIdOrId
            );
            if (!hasMatch) return state;
            const updated = existing.map((m) =>
              m.clientId === clientIdOrId || m.id === clientIdOrId ? { ...m, status } : m
            );
            return { messages: { ...state.messages, [conversationId]: updated } };
          },
          false,
          "updateMessageStatus"
        ),
      markMessagesRead: (conversationId, messageId, userId, readAt) =>
        set(
          (state) => {
            const existing = state.messages[conversationId] ?? [];
            const updated = applyMessageReadInList(existing, messageId, userId, readAt);
            const existingConv = state.conversations[conversationId];
            const nextConversations =
              existingConv && existingConv.unreadCount !== 0
                ? {
                    ...state.conversations,
                    [conversationId]: { ...existingConv, unreadCount: 0 },
                  }
                : state.conversations;
            if (!updated && nextConversations === state.conversations) return state;
            return {
              conversations: nextConversations,
              messages: updated ? { ...state.messages, [conversationId]: updated } : state.messages,
            };
          },
          false,
          "markMessagesRead"
        ),
      toggleMessageReaction: (conversationId, messageId, emoji) =>
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [conversationId]: toggleReactionInList(
                state.messages[conversationId] ?? [],
                messageId,
                emoji
              ),
            },
          }),
          false,
          "toggleMessageReaction"
        ),
      removeAttachment: (conversationId, messageId, attachmentId) =>
        set(
          (state) => {
            const existing = state.messages[conversationId] ?? [];
            const updated = existing.map((m) =>
              m.id === messageId || m.clientId === messageId
                ? {
                    ...m,
                    attachments: m.attachments.map((att) =>
                      att.id === attachmentId
                        ? { ...att, deletedAt: new Date().toISOString() }
                        : att
                    ),
                  }
                : m
            );
            return { messages: { ...state.messages, [conversationId]: updated } };
          },
          false,
          "removeAttachment"
        ),
      updateConversationStatus: (conversationId, status) =>
        set(
          (state) => {
            const conv = state.conversations[conversationId];
            if (!conv) return state;
            return {
              conversations: {
                ...state.conversations,
                [conversationId]: { ...conv, status },
              },
            };
          },
          false,
          "updateConversationStatus"
        ),
      setTypingUsers: (conversationId, userIds) =>
        set(
          (state) => ({
            typingUsers: { ...state.typingUsers, [conversationId]: userIds },
          }),
          false,
          "setTypingUsers"
        ),
      setIsLoadingConversations: (v) =>
        set({ isLoadingConversations: v }, false, "setIsLoadingConversations"),
      setIsLoadingMessages: (v) => set({ isLoadingMessages: v }, false, "setIsLoadingMessages"),
      setError: (error) => set({ error }, false, "setError"),
      setSupportPresence: (presence) =>
        set({ supportPresence: presence }, false, "setSupportPresence"),
      setQueueStatus: (conversationId, queueStatus) =>
        set(
          (state) => ({
            queueStatuses: { ...state.queueStatuses, [conversationId]: queueStatus },
          }),
          false,
          "setQueueStatus"
        ),
      setOutboundQueueCount: (outboundQueueCount) =>
        set({ outboundQueueCount }, false, "setOutboundQueueCount"),
      reset: () => set(initialState, false, "resetChat"),
    }),
    devtoolsConfig("ChatStore")
  )
);

const conversationsListCache = new WeakMap<
  Record<string, ConversationEntity>,
  ConversationEntity[]
>();

export const selectConversations = (state: ChatState): ConversationEntity[] => {
  const existing = conversationsListCache.get(state.conversations);
  if (existing) return existing;
  const computed = Object.values(state.conversations);
  conversationsListCache.set(state.conversations, computed);
  return computed;
};
export const selectCurrentConversationId = (state: ChatState) => state.currentConversationId;
export const selectMessages = (conversationId: string) => (state: ChatState) =>
  state.messages[conversationId] ?? EMPTY_MESSAGES;
export const selectNextCursor = (conversationId: string) => (state: ChatState) =>
  state.nextCursors[conversationId] ?? null;
export const selectTypingUsers = (conversationId: string) => (state: ChatState) =>
  state.typingUsers[conversationId] ?? EMPTY_TYPING_USERS;
export const selectIsLoadingConversations = (state: ChatState) => state.isLoadingConversations;
export const selectIsLoadingMessages = (state: ChatState) => state.isLoadingMessages;
export const selectChatError = (state: ChatState) => state.error;
export const selectSupportPresence = (state: ChatState) => state.supportPresence;
export const selectQueueStatus = (conversationId: string) => (state: ChatState) =>
  state.queueStatuses[conversationId] ?? null;
