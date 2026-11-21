/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { ScrollView, View } from "react-native";

import { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";
import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useHaptics, useUI } from "@/src/presentation/hooks";

import { styles } from "./ChatFaqOptionsBar.styles";
import type { ChatFaqOptionsBarProps, FaqTopic } from "./ChatFaqOptionsBar.types";

const QUICK_ICEBREAKERS: readonly FaqTopic[] = [
  {
    id: "architecture",
    labelKey: "chat.faq.promptArchitecture",
    query: "Walk me through the Clean Architecture",
    icon: "layers-outline",
  },
  {
    id: "offlineQueue",
    labelKey: "chat.faq.promptOfflineQueue",
    query: "How does the MMKV offline outbox work?",
    icon: "cloud-offline-outline",
  },
  {
    id: "voiceNotes",
    labelKey: "chat.faq.promptVoiceNotes",
    query: "Test a simulated voice note reply",
    icon: "mic-outline",
  },
  {
    id: "uiMotion",
    labelKey: "chat.faq.promptUiMotion",
    query: "What powers the animations?",
    icon: "sparkles-outline",
  },
  {
    id: "roulette",
    labelKey: "chat.faq.promptRoulette",
    query: "Match me with a random engineer",
    icon: "shuffle-outline",
  },
];

export const ChatFaqOptionsBar = memo<ChatFaqOptionsBarProps>(
  ({ onSelectOption, disabled = false, testID = "chat-faq-options-bar" }) => {
    const { colors, t } = useUI();
    const haptics = useHaptics();

    const handleHaptics = useCallback(
      (type: HapticFeedbackType) => haptics.trigger(type),
      [haptics]
    );

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.eyebrowIcon, { backgroundColor: colors.accentTint }]}>
            <Ionicons name="sparkles" size={11} color={colors.accent} />
          </View>
          <Text variant="xs" weight="bold" color={colors.textSecondary} style={styles.eyebrowText}>
            {t("chat.faq.quickTopics")}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {QUICK_ICEBREAKERS.map((topic) => {
            const label = t(topic.labelKey);
            return (
              <AnimatedPressable
                key={topic.id}
                testID={`faq-chip-${topic.id}`}
                accessibilityRole="button"
                accessibilityLabel={label}
                disabled={disabled}
                hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                scaleTo={0.96}
                hapticType={HapticFeedbackType.Light}
                onHaptic={handleHaptics}
                onPress={() => {
                  onSelectOption(label);
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    opacity: disabled ? 0.5 : 1,
                  },
                ]}
              >
                <View style={[styles.chipIconBadge, { backgroundColor: colors.accentTint }]}>
                  <Ionicons name={topic.icon} size={12} color={colors.accent} />
                </View>
                <Text variant="xs" weight="medium" color={colors.textPrimary}>
                  {label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }
);

ChatFaqOptionsBar.displayName = "ChatFaqOptionsBar";
