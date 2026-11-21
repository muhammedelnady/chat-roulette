/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

import { styles } from "./ChatMessageBubble.styles";

export interface BotOptionItem {
  readonly id: string;
  readonly labelEn: string;
  readonly labelAr?: string;
  readonly query?: string;
}

export interface MessageBotOptionsProps {
  readonly options: readonly BotOptionItem[];
  readonly onSelectOption?: (query: string) => void;
}

export const MessageBotOptions = memo<MessageBotOptionsProps>(({ options, onSelectOption }) => {
  const { colors, isRTL } = useUI();

  if (options.length === 0) {
    return null;
  }

  return (
    <View style={styles.botOptionsContainer}>
      {options.map((opt) => {
        const optionLabel = isRTL ? (opt.labelAr ?? opt.labelEn) : opt.labelEn;
        return (
          <Pressable
            key={opt.id}
            testID={`bot-bubble-opt-${opt.id}`}
            onPress={() => onSelectOption?.(opt.query ?? optionLabel)}
            style={({ pressed }) => [
              styles.botOptionPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderStrong,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="sparkles-outline" size={13} color={colors.accent} />
            <Text variant="xs" color={colors.textPrimary}>
              {optionLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

MessageBotOptions.displayName = "MessageBotOptions";
