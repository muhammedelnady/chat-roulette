/** @format */
/**
 * Infrastructure Env
 */

import { z } from "zod/v4";

const envSchema = z.object({
  EXPO_PUBLIC_CHAT_MODE: z.enum(["simulated", "socket"]).default("simulated"),
  EXPO_PUBLIC_API_URL: z.url("API URL must be a valid URL").default("http://localhost:3000"),
  EXPO_PUBLIC_ENV: z.enum(["development", "staging", "production"]).default("development"),
  EXPO_PUBLIC_APP_SCHEME: z.string().default("chatroulette"),
});

export const env = envSchema.parse({
  EXPO_PUBLIC_CHAT_MODE: process.env.EXPO_PUBLIC_CHAT_MODE ?? "simulated",
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV ?? "development",
  EXPO_PUBLIC_APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME ?? "chatroulette",
});

export type Env = z.infer<typeof envSchema>;
export const isSimulatedChatMode = env.EXPO_PUBLIC_CHAT_MODE === "simulated";
export const isDevelopment = env.EXPO_PUBLIC_ENV === "development";
export const isProduction = env.EXPO_PUBLIC_ENV === "production";
