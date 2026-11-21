/** @format */

import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { TxKeyPath } from "@/src/infrastructure/i18n/types";

export const MATCH_SCAN_DELAY_MS = 1100;

export const CHAT_ROULETTE_TEST_IDS = {
  ROOT: "chat-roulette-content",
  BACK_BUTTON: "roulette-back-button",
  START_BUTTON: "roulette-start-button",
  CANCEL_BUTTON: "roulette-cancel-button",
  ERROR_BANNER: "roulette-error-banner",
  TOPIC_CHIP: (id: string) => `roulette-topic-${id}`,
} as const;

export const ROULETTE_TOPICS: readonly {
  readonly id: string;
  readonly value: string;
  readonly labelKey: TxKeyPath;
  readonly icon: ComponentProps<typeof Ionicons>["name"];
}[] = [
  { id: "rn", value: "React Native", labelKey: "roulette.topicReactNative", icon: "logo-react" },
  {
    id: "sys",
    value: "System Design",
    labelKey: "roulette.topicSystemDesign",
    icon: "server-outline",
  },
  {
    id: "ai",
    value: "AI Agents",
    labelKey: "roulette.topicAiAgents",
    icon: "hardware-chip-outline",
  },
  {
    id: "ui",
    value: "UI/UX Motion",
    labelKey: "roulette.topicUiMotion",
    icon: "color-wand-outline",
  },
  {
    id: "founders",
    value: "Founders",
    labelKey: "roulette.topicFounders",
    icon: "rocket-outline",
  },
];
