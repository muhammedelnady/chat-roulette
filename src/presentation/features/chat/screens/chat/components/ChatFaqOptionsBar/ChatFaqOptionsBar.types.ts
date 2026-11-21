/** @format */

import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { TxKeyPath } from "@/src/infrastructure/i18n/types";

export interface FaqTopic {
  readonly id: string;
  readonly labelKey: TxKeyPath;
  readonly query: string;
  readonly icon: ComponentProps<typeof Ionicons>["name"];
}

export interface ChatFaqOptionsBarProps {
  readonly onSelectOption: (query: string) => void;
  readonly disabled?: boolean;
  readonly testID?: string;
}
