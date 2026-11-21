/** @format */

import { z } from "zod/v4";

export const attachmentDtoSchema = z.object({
  id: z.string().optional(),
  uploadId: z.string().optional(),
  url: z.string().optional(),
  mimeType: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  cloudinaryId: z.string().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
});

export const messageDtoSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().optional().default(""),
  conversationId: z.string().min(1),
  senderId: z.string().nullable().optional(),
  senderType: z.string(),
  senderName: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  contentType: z.string().default("text"),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  replyToId: z.string().nullable().optional(),
  isEdited: z.boolean().default(false),
  deletedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  status: z.string().optional(),
  readReceipts: z
    .array(
      z.object({
        userId: z.string(),
        readAt: z.string(),
      })
    )
    .optional(),
  attachments: z.array(attachmentDtoSchema).optional(),
  reactions: z.record(z.string(), z.array(z.string())).optional(),
});

export const participantDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
  user: z
    .object({
      id: z.string(),
      fullName: z.string(),
      image: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const roomCategorySchema = z.enum(["TRENDING", "TECH", "DESIGN", "FOUNDERS", "ROULETTE"]);

export const conversationDtoSchema = z.object({
  id: z.string().min(1),
  scope: z.string(),
  handledBy: z.string(),
  status: z.string().optional(),
  orderId: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  guestSessionId: z.string().nullable().optional(),
  closedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  participants: z.array(participantDtoSchema).optional(),
  messages: z.array(messageDtoSchema).optional(),
  category: roomCategorySchema.optional(),
  topic: z.string().nullable().optional(),
  participantCount: z.number().optional(),
  unreadCount: z.number().optional(),
  isRouletteMatch: z.boolean().optional(),
  icebreaker: z.string().nullable().optional(),
  partnerRole: z.string().nullable().optional(),
  partnerLocation: z.string().nullable().optional(),
});

export const conversationListResponseSchema = z.object({
  data: z.array(conversationDtoSchema),
  nextCursor: z.string().nullable().default(null),
});

export const messagesListResponseSchema = z.object({
  data: z.array(messageDtoSchema),
  nextCursor: z.string().nullable().default(null),
});

export const uploadAudioResultSchema = z.object({
  uploadId: z.string().min(1),
  url: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number(),
  durationSeconds: z.number(),
  waveformBars: z.array(z.number()),
});
