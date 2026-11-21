/** @format */

import type { TxKeyPath } from "@/src/infrastructure/i18n/types";

export const CHAT_ROULETTE_TEST_IDS = {
  ROOT: "chat-roulette-content",
  BACK_BUTTON: "roulette-back-button",
  START_BUTTON: "roulette-start-button",
  CANCEL_BUTTON: "roulette-cancel-button",
  TOPIC_CHIP: (id: string) => `roulette-topic-${id}`,
} as const;

export const ROULETTE_TOPICS: readonly {
  readonly id: string;
  readonly value: string;
  readonly labelKey: TxKeyPath;
}[] = [
  { id: "rn", value: "React Native", labelKey: "roulette.topicReactNative" },
  { id: "sys", value: "System Design", labelKey: "roulette.topicSystemDesign" },
  { id: "ai", value: "AI Agents", labelKey: "roulette.topicAiAgents" },
  { id: "ui", value: "UI/UX Motion", labelKey: "roulette.topicUiMotion" },
  { id: "founders", value: "Founders", labelKey: "roulette.topicFounders" },
];
