/** @format */

import { z } from "zod/v4";

export const CHAT_SCOPES = ["BOT", "SUPPORT", "ROOM", "ROULETTE"] as const;
export type ChatScope = (typeof CHAT_SCOPES)[number];

export const zChatScope = z.enum(CHAT_SCOPES);
