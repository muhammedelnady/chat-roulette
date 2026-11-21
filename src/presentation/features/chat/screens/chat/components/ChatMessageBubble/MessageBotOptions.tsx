/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { View } from "react-native";

import { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";
import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useHaptics, useUI } from "@/src/presentation/hooks";

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
  const haptics = useHaptics();
  const handleHaptics = useCallback((type: HapticFeedbackType) => haptics.trigger(type), [haptics]);

  if (options.length === 0) {
    return null;
  }

  return (
    <View style={styles.botOptionsContainer}>
      {options.map((opt) => {
        const optionLabel = isRTL ? (opt.labelAr ?? opt.labelEn) : opt.labelEn;
        return (
          <AnimatedPressable
            key={opt.id}
            testID={`bot-bubble-opt-${opt.id}`}
            accessibilityRole="button"
            accessibilityLabel={optionLabel}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            scaleTo={0.97}
            hapticType={HapticFeedbackType.Light}
            onHaptic={handleHaptics}
            onPress={() => {
              onSelectOption?.(optionLabel);
            }}
            style={[
              styles.botOptionPill,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.botOptionLeft}>
              <Ionicons name="sparkles-outline" size={13} color={colors.accent} />
              <Text variant="xs" weight="medium" color={colors.textPrimary} numberOfLines={1}>
                {optionLabel}
              </Text>
            </View>
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={13}
              color={colors.textMuted}
            />
          </AnimatedPressable>
        );
      })}
    </View>
  );
});

MessageBotOptions.displayName = "MessageBotOptions";
