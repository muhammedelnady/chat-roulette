/** @format */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { memo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";

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
    const { colors, t, isRTL } = useUI();

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Ionicons name="sparkles" size={13} color={colors.accent} />
          <Text variant="xs" weight="bold" color={colors.textSecondary}>
            {t("chat.faq.quickTopics")}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {QUICK_ICEBREAKERS.map((topic) => (
            <Pressable
              key={topic.id}
              testID={`faq-chip-${topic.id}`}
              disabled={disabled}
              onPress={() => {
                void Haptics.selectionAsync();
                onSelectOption(topic.query);
              }}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderStrong,
                },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Ionicons name={topic.icon} size={13} color={colors.accent} />
              <Text variant="xs" color={colors.textPrimary}>
                {t(topic.labelKey)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }
);

ChatFaqOptionsBar.displayName = "ChatFaqOptionsBar";
