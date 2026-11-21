/** @format */

import type { ChatAttachmentEntity, ChatMessageEntity } from "../../../../shared/types";
import { isPreviewableImageUrl, resolveSafeMediaUrl } from "../../../../shared/utils/urlValidator";

import type { BotOptionItem } from "./MessageBotOptions";

export interface AudioMessageMetadata {
  readonly audioUrl?: string;
  readonly duration?: number;
  readonly waveform?: readonly number[];
}

export function isBotMessage(message: ChatMessageEntity): boolean {
  return (
    message.senderType === "BOT" ||
    Boolean(
      message.metadata &&
      typeof message.metadata === "object" &&
      "isBotGreeting" in message.metadata &&
      message.metadata["isBotGreeting"] === true
    )
  );
}

export function extractBotOptions(
  message: ChatMessageEntity,
  isBot: boolean
): BotOptionItem[] | null {
  if (
    !isBot ||
    !message.metadata ||
    typeof message.metadata !== "object" ||
    !("options" in message.metadata) ||
    !Array.isArray(message.metadata["options"])
  ) {
    return null;
  }

  const valid = message.metadata["options"].filter((item): item is BotOptionItem => {
    if (!item || typeof item !== "object") return false;
    const obj = item as Record<string, unknown>;
    return typeof obj["id"] === "string" && typeof obj["labelEn"] === "string";
  });

  return valid.length > 0 ? valid : null;
}

export function extractAudioMetadata(message: ChatMessageEntity): {
  readonly isAudio: boolean;
  readonly audioUrl: string;
  readonly audioDuration: number;
  readonly audioWaveform?: readonly number[];
} {
  const isAudio =
    message.contentType === "AUDIO" ||
    Boolean(
      message.metadata && typeof message.metadata === "object" && "audioUrl" in message.metadata
    );

  const metaObj =
    isAudio && message.metadata && typeof message.metadata === "object" ? message.metadata : null;

  const rawUrl =
    typeof metaObj?.["audioUrl"] === "string" ? metaObj["audioUrl"] : (message.content ?? "");
  const audioUrl = resolveSafeMediaUrl(rawUrl, { allowLocal: true });
  const rawDuration = metaObj?.["duration"];
  const audioDuration =
    typeof rawDuration === "number" && Number.isFinite(rawDuration) ? rawDuration : 0;
  const rawWaveform = metaObj?.["waveform"];
  const audioWaveform = Array.isArray(rawWaveform)
    ? rawWaveform.filter((n): n is number => typeof n === "number" && Number.isFinite(n))
    : undefined;

  return {
    isAudio,
    audioUrl,
    audioDuration,
    audioWaveform,
  };
}

export function formatMessageTimestamp(createdAt: string): string {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "";
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function resolvePreviewableImageUrl(attachment: ChatAttachmentEntity): string | null {
  if (attachment.deletedAt) return null;
  const resolvedUrl = resolveSafeMediaUrl(attachment.url, { allowLocal: true });
  if (!resolvedUrl) return null;
  return isPreviewableImageUrl(resolvedUrl, attachment.mimeType) ? resolvedUrl : null;
}
