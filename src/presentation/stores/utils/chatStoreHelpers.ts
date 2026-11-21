/** @format */

import type { MessageEntity } from "@/src/domain/entities";

export function mergeInitialMessages(
  existing: readonly MessageEntity[],
  incoming: readonly MessageEntity[]
): MessageEntity[] {
  const pending = existing.filter(
    (m) =>
      m.status === "PENDING" &&
      !incoming.some((nm) => nm.clientId === m.clientId || (nm.id && nm.id === m.id))
  );
  return [...incoming, ...pending].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
}

export function upsertMessageInList(
  existing: readonly MessageEntity[],
  message: MessageEntity
): { readonly messages: MessageEntity[]; readonly inserted: boolean } {
  const idx = existing.findIndex(
    (m) => m.clientId === message.clientId || (message.id && m.id === message.id)
  );
  if (idx >= 0) {
    const updated = [...existing];
    const prev = updated[idx];
    const nextStatus =
      message.status ?? (prev?.status === "PENDING" ? "DELIVERED" : prev?.status) ?? "DELIVERED";
    updated[idx] = { ...prev, ...message, status: nextStatus };
    return { messages: updated, inserted: false };
  }
  const next = [...existing, message].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
  return { messages: next, inserted: true };
}

export function applyMessageReadInList(
  existing: readonly MessageEntity[],
  messageId: string,
  userId: string,
  readAt: string
): MessageEntity[] | null {
  const targetIndex = existing.findIndex(
    (message) => message.id === messageId || message.clientId === messageId
  );
  if (targetIndex < 0) return null;

  return existing.map((m, index) => {
    if (index > targetIndex) return m;
    const receipts = m.readReceipts ?? [];
    if (!receipts.some((r) => r.userId === userId)) {
      return {
        ...m,
        status: "READ" as const,
        readReceipts: [...receipts, { userId, readAt }],
      };
    }
    return { ...m, status: "READ" as const };
  });
}

export function toggleReactionInList(
  existing: readonly MessageEntity[],
  messageId: string,
  emoji: string
): MessageEntity[] {
  return existing.map((m) => {
    if (m.id !== messageId && m.clientId !== messageId) return m;
    const nextReactions = { ...(m.reactions ?? {}) };
    const users = nextReactions[emoji] ? [...nextReactions[emoji]] : [];
    if (users.includes("you")) {
      const remaining = users.filter((u) => u !== "you");
      if (remaining.length === 0) {
        delete nextReactions[emoji];
      } else {
        nextReactions[emoji] = remaining;
      }
    } else {
      nextReactions[emoji] = [...users, "you"];
    }
    return { ...m, reactions: nextReactions };
  });
}
