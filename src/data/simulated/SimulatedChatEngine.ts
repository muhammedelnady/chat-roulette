/** @format */
/**
 * Data Simulated Chat Engine
 */

import type { ConversationEntity, MessageEntity } from "@/src/domain/entities";
import { generateUUID } from "@/src/domain/utils/uuid";

import {
  INITIAL_SIMULATED_CONVERSATIONS,
  INITIAL_SIMULATED_MESSAGES,
  ROULETTE_PERSONAS,
} from "./SimulatedChatDataset";

function cloneUnknown(val: unknown): unknown {
  if (val === null || typeof val !== "object") return val;
  if (Array.isArray(val)) return val.map(cloneUnknown);
  return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, cloneUnknown(v)]));
}

function cloneMessage(msg: MessageEntity): MessageEntity {
  return {
    ...msg,
    metadata: msg.metadata ? (cloneUnknown(msg.metadata) as Record<string, unknown>) : msg.metadata,
    attachments: msg.attachments.map((att) => ({ ...att })),
    readReceipts: msg.readReceipts ? msg.readReceipts.map((r) => ({ ...r })) : undefined,
    reactions: msg.reactions
      ? Object.fromEntries(Object.entries(msg.reactions).map(([k, v]) => [k, [...v]]))
      : undefined,
  };
}

function cloneConversation(conv: ConversationEntity): ConversationEntity {
  return {
    ...conv,
    participants: conv.participants.map((p) => ({
      ...p,
      user: p.user ? { ...p.user } : undefined,
    })),
    lastMessage: conv.lastMessage ? cloneMessage(conv.lastMessage) : conv.lastMessage,
  };
}

export class SimulatedChatEngine {
  private conversations = new Map<string, ConversationEntity>();
  private messages = new Map<string, MessageEntity[]>();
  private rouletteCursor = 0;

  constructor() {
    this.seed();
  }

  private seed(): void {
    for (const conv of INITIAL_SIMULATED_CONVERSATIONS) {
      const seededMessages = (INITIAL_SIMULATED_MESSAGES[conv.id] ?? []).map(cloneMessage);
      this.messages.set(conv.id, seededMessages);
      const lastMessage = seededMessages[seededMessages.length - 1] ?? null;
      this.conversations.set(conv.id, {
        ...cloneConversation(conv),
        lastMessage: lastMessage ? cloneMessage(lastMessage) : null,
      });
    }
  }

  listConversations(): ConversationEntity[] {
    return Array.from(this.conversations.values())
      .map(cloneConversation)
      .sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0));
  }

  getConversationById(conversationId: string): ConversationEntity | null {
    const found = this.conversations.get(conversationId);
    return found ? cloneConversation(found) : null;
  }

  createConversation(params: {
    scope?: string;
    subject?: string;
    topic?: string;
    category?: string;
  }): ConversationEntity {
    const id = `room-${generateUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();
    const conversation: ConversationEntity = {
      id,
      scope: params.scope === "ROULETTE" ? "ROULETTE" : "ROOM",
      handledBy: "COMMUNITY",
      status: "OPEN",
      subject: params.subject ?? "Live Engineering Room",
      topic: params.topic ?? "Open Technical Discussion",
      category:
        params.category === "TECH" ||
        params.category === "TRENDING" ||
        params.category === "DESIGN" ||
        params.category === "FOUNDERS" ||
        params.category === "ROULETTE"
          ? params.category
          : "TECH",
      participantCount: 12,
      unreadCount: 0,
      isRouletteMatch: false,
      icebreaker: "What are you shipping this week?",
      createdAt: nowIso,
      updatedAt: nowIso,
      participants: [
        {
          id: `p-${id}`,
          userId: "bot-pulse-host",
          role: "SUPPORT_AGENT",
          user: { id: "bot-pulse-host", fullName: params.subject ?? "Pulse Room", image: null },
        },
      ],
      lastMessage: null,
    };

    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return cloneConversation(conversation);
  }

  matchRoulette(topic?: string): ConversationEntity {
    const matchingPool = topic
      ? ROULETTE_PERSONAS.filter((p) => p.topic.toLowerCase() === topic.toLowerCase())
      : [];
    const pool = matchingPool.length > 0 ? matchingPool : ROULETTE_PERSONAS;
    const persona = pool[this.rouletteCursor % pool.length] ?? ROULETTE_PERSONAS[0];
    this.rouletteCursor += 1;

    if (!persona) {
      return this.createConversation({ scope: "ROULETTE", subject: "Instant Match" });
    }

    const id = `roulette-${persona.id}-${generateUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();
    const openerMessage: MessageEntity = {
      id: `msg-${generateUUID().slice(0, 8)}`,
      clientId: `client-${generateUUID().slice(0, 8)}`,
      conversationId: id,
      senderId: persona.id,
      senderType: "SUPPORT_AGENT",
      senderName: persona.name,
      content: persona.opener,
      contentType: "text",
      status: "READ",
      isEdited: false,
      createdAt: nowIso,
      attachments: [],
    };

    const conversation: ConversationEntity = {
      id,
      scope: "ROULETTE",
      handledBy: "PEER",
      status: "OPEN",
      subject: persona.name,
      topic: persona.topic,
      category: "ROULETTE",
      participantCount: 2,
      unreadCount: 1,
      isRouletteMatch: true,
      partnerRole: persona.role,
      partnerLocation: persona.location,
      icebreaker: persona.icebreaker,
      createdAt: nowIso,
      updatedAt: nowIso,
      participants: [
        {
          id: `p-${persona.id}`,
          userId: persona.id,
          role: "SUPPORT_AGENT",
          user: { id: persona.id, fullName: persona.name, image: null },
        },
      ],
      lastMessage: openerMessage,
    };

    this.conversations.set(id, conversation);
    this.messages.set(id, [openerMessage]);
    return cloneConversation(conversation);
  }

  closeConversation(conversationId: string): ConversationEntity | null {
    const existing = this.conversations.get(conversationId);
    if (!existing) return null;
    const updated: ConversationEntity = {
      ...existing,
      status: "CLOSED",
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(conversationId, updated);
    return cloneConversation(updated);
  }

  markConversationRead(conversationId: string): void {
    const existing = this.conversations.get(conversationId);
    if (!existing || existing.unreadCount === 0) return;
    this.conversations.set(conversationId, {
      ...existing,
      unreadCount: 0,
    });
  }

  listMessages(conversationId: string): MessageEntity[] {
    return (this.messages.get(conversationId) ?? []).map(cloneMessage);
  }

  upsertMessage(conversationId: string, message: MessageEntity): MessageEntity {
    const list = this.messages.get(conversationId) ?? [];
    const idx = list.findIndex(
      (item) => item.clientId === message.clientId || (message.id && item.id === message.id)
    );
    const stored = cloneMessage(message);
    const isNew = idx < 0;
    if (idx >= 0) {
      list[idx] = stored;
    } else {
      list.push(stored);
    }
    this.messages.set(conversationId, list);

    const conv = this.conversations.get(conversationId);
    if (conv) {
      const nextUnread =
        stored.senderType === "USER"
          ? 0
          : isNew
            ? (conv.unreadCount ?? 0) + 1
            : (conv.unreadCount ?? 0);
      this.conversations.set(conversationId, {
        ...conv,
        lastMessage: cloneMessage(stored),
        updatedAt: stored.createdAt,
        unreadCount: nextUnread,
      });
    }

    return cloneMessage(stored);
  }

  deleteAttachment(attachmentId: string): void {
    const nowIso = new Date().toISOString();
    for (const [convId, list] of this.messages.entries()) {
      const hasMatch = list.some((msg) =>
        msg.attachments.some((att) => att.id === attachmentId || att.uploadId === attachmentId)
      );
      if (!hasMatch) continue;
      const nextList = list.map((msg) => {
        if (
          !msg.attachments.some((att) => att.id === attachmentId || att.uploadId === attachmentId)
        ) {
          return msg;
        }
        return {
          ...msg,
          attachments: msg.attachments.map((att) =>
            att.id === attachmentId || att.uploadId === attachmentId
              ? { ...att, deletedAt: nowIso }
              : att
          ),
        };
      });
      this.messages.set(convId, nextList);
      const conv = this.conversations.get(convId);
      const latest = nextList[nextList.length - 1];
      if (conv && latest && conv.lastMessage?.id === latest.id) {
        this.conversations.set(convId, { ...conv, lastMessage: cloneMessage(latest) });
      }
    }
  }

  toggleReaction(conversationId: string, messageId: string, emoji: string): MessageEntity | null {
    const list = this.messages.get(conversationId);
    if (!list) return null;
    const idx = list.findIndex((m) => m.id === messageId || m.clientId === messageId);
    if (idx < 0) return null;
    const target = list[idx];
    if (!target) return null;

    const currentReactions = target.reactions ? { ...target.reactions } : {};
    const users = currentReactions[emoji] ? [...currentReactions[emoji]] : [];
    const hasReacted = users.includes("you");
    if (hasReacted) {
      const filtered = users.filter((u) => u !== "you");
      if (filtered.length === 0) {
        delete currentReactions[emoji];
      } else {
        currentReactions[emoji] = filtered;
      }
    } else {
      currentReactions[emoji] = [...users, "you"];
    }

    const updated: MessageEntity = {
      ...target,
      reactions: currentReactions,
    };
    list[idx] = updated;

    const conv = this.conversations.get(conversationId);
    if (
      conv?.lastMessage &&
      (conv.lastMessage.id === updated.id || conv.lastMessage.clientId === updated.clientId)
    ) {
      this.conversations.set(conversationId, { ...conv, lastMessage: cloneMessage(updated) });
    }

    return cloneMessage(updated);
  }

  buildSimulatedReply(conversationId: string, userContent?: string): MessageEntity {
    const conv = this.conversations.get(conversationId);
    const senderName = conv?.subject ?? "Pulse Host";
    const normalized = (userContent ?? "").toLowerCase();

    if (
      normalized.includes("voice") ||
      normalized.includes("audio") ||
      normalized.includes("صوت")
    ) {
      const voiceReply: MessageEntity = {
        id: `msg-${generateUUID().slice(0, 8)}`,
        clientId: `reply-${generateUUID().slice(0, 8)}`,
        conversationId,
        senderId: "sim-partner",
        senderType: "SUPPORT_AGENT",
        senderName,
        content:
          "Here is an interactive voice note with live waveform scrubbing & 1x/1.5x/2x speed!",
        contentType: "AUDIO",
        status: "DELIVERED",
        isEdited: false,
        createdAt: new Date().toISOString(),
        attachments: [],
        metadata: {
          audioUrl: "simulated://reply-voice-note.m4a",
          duration: 7,
          waveform: [0.3, 0.65, 0.9, 0.5, 0.85, 0.75, 0.4, 0.92, 0.6, 0.45, 0.7, 0.35],
        },
      };
      return this.upsertMessage(conversationId, voiceReply);
    }

    let replyText = `Great point! In ${conv?.topic ?? "this room"}, every message flows through Domain UseCases -> DI -> Zustand + MMKV Outbox.`;
    if (
      normalized.includes("architecture") ||
      normalized.includes("clean") ||
      normalized.includes("معمارية")
    ) {
      replyText =
        "Clean Architecture enforces strict inward dependencies: Domain defines entities & Result<T, AppError>, Data implements repositories + ChatOutboundQueue, and Presentation stays <= 300 LOC per file.";
    } else if (
      normalized.includes("outbox") ||
      normalized.includes("offline") ||
      normalized.includes("mmkv") ||
      normalized.includes("طابور")
    ) {
      replyText =
        "When Offline Sim is active, messages persist to ChatOutboundQueue in MMKV as PENDING. Toggling back Online triggers connectivity observers that flush the queue in order with zero duplicates.";
    } else if (
      normalized.includes("animation") ||
      normalized.includes("motion") ||
      normalized.includes("تحريك")
    ) {
      replyText =
        "Reanimated 4 shared values drive the press springs, typing entrance/exit transitions, and the Chat Roulette radar rings cleanly on the UI thread.";
    } else if (
      normalized.includes("roulette") ||
      normalized.includes("match") ||
      normalized.includes("طابق")
    ) {
      replyText =
        "Jump back to Pulse Rooms and hit Spin Roulette to test the topic-matched radar pairing flow!";
    }

    const textReply: MessageEntity = {
      id: `msg-${generateUUID().slice(0, 8)}`,
      clientId: `reply-${generateUUID().slice(0, 8)}`,
      conversationId,
      senderId: "sim-partner",
      senderType: "SUPPORT_AGENT",
      senderName,
      content: replyText,
      contentType: "text",
      status: "DELIVERED",
      isEdited: false,
      createdAt: new Date().toISOString(),
      attachments: [],
    };

    return this.upsertMessage(conversationId, textReply);
  }
}

export const sharedSimulatedChatEngine = new SimulatedChatEngine();
