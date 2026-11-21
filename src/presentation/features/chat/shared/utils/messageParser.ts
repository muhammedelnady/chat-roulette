/** @format */

import type { ChatMessageEntity } from "../types";

import { resolveSafeMediaUrl } from "./urlValidator";

export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

export function parseIncomingMessage(raw: Record<string, unknown>): ChatMessageEntity | null {
  const id = typeof raw["id"] === "string" && raw["id"].length > 0 ? raw["id"] : null;
  const conversationId =
    typeof raw["conversationId"] === "string" ? raw["conversationId"] : undefined;
  const senderTypeRaw = raw["senderType"];
  const senderType: ChatMessageEntity["senderType"] =
    senderTypeRaw === "USER" ||
    senderTypeRaw === "SYSTEM" ||
    senderTypeRaw === "SUPPORT_AGENT" ||
    senderTypeRaw === "BOT"
      ? senderTypeRaw
      : "SUPPORT_AGENT";

  if (!id || !conversationId) return null;

  const rawAttachments = Array.isArray(raw["attachments"]) ? raw["attachments"] : [];
  const attachments = rawAttachments
    .filter(isRecord)
    .map((att) => ({
      id: typeof att["id"] === "string" ? att["id"] : String(att["uploadId"] ?? ""),
      uploadId: typeof att["uploadId"] === "string" ? att["uploadId"] : undefined,
      url:
        typeof att["url"] === "string"
          ? resolveSafeMediaUrl(att["url"], { allowLocal: false })
          : "",
      mimeType: typeof att["mimeType"] === "string" ? att["mimeType"] : "application/octet-stream",
      fileName: typeof att["fileName"] === "string" ? att["fileName"] : "attachment",
      fileSize: typeof att["fileSize"] === "number" ? att["fileSize"] : 0,
      width: typeof att["width"] === "number" ? att["width"] : null,
      height: typeof att["height"] === "number" ? att["height"] : null,
      deletedAt: typeof att["deletedAt"] === "string" ? att["deletedAt"] : null,
    }))
    .filter((att) => att.id.length > 0 && att.url.length > 0);

  return {
    id,
    clientId:
      typeof raw["clientId"] === "string" && raw["clientId"].length > 0 ? raw["clientId"] : id,
    conversationId,
    senderId: typeof raw["senderId"] === "string" ? raw["senderId"] : null,
    senderType,
    senderName: typeof raw["senderName"] === "string" ? raw["senderName"] : null,
    content: typeof raw["content"] === "string" ? raw["content"] : null,
    contentType: typeof raw["contentType"] === "string" ? raw["contentType"] : "text",
    status:
      raw["status"] === "PENDING" ||
      raw["status"] === "SENT" ||
      raw["status"] === "DELIVERED" ||
      raw["status"] === "READ" ||
      raw["status"] === "FAILED"
        ? raw["status"]
        : "DELIVERED",
    metadata: isRecord(raw["metadata"]) ? raw["metadata"] : null,
    replyToId: typeof raw["replyToId"] === "string" ? raw["replyToId"] : null,
    isEdited: Boolean(raw["isEdited"]),
    deletedAt: typeof raw["deletedAt"] === "string" ? raw["deletedAt"] : null,
    createdAt: typeof raw["createdAt"] === "string" ? raw["createdAt"] : new Date().toISOString(),
    attachments,
    reactions: isRecord(raw["reactions"])
      ? (raw["reactions"] as Record<string, string[]>)
      : undefined,
  };
}
