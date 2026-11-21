/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button, Text } from "@/src/presentation/components/atoms";
import { PageLayout } from "@/src/presentation/components/templates";
import { useUI } from "@/src/presentation/hooks";
import { gradients } from "@/src/presentation/theme";

import { MatchRevealCard, RadarPulse } from "../components";

import { CHAT_ROULETTE_TEST_IDS, ROULETTE_TOPICS } from "./ChatRouletteContent.constants";
import { styles } from "./ChatRouletteContent.styles";
import type { ChatRouletteContentProps, ChatRouletteViewModel } from "./ChatRouletteContent.types";
import { useChatRouletteViewModel } from "./ChatRouletteContent.viewmodel";

const ChatRouletteContentView = memo<{
  readonly viewModel: ChatRouletteViewModel;
  readonly testID?: string;
}>(({ viewModel, testID = CHAT_ROULETTE_TEST_IDS.ROOT }) => {
  const { colors, t, isRTL } = useUI();

  return (
    <PageLayout testID={testID}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable
            testID={CHAT_ROULETTE_TEST_IDS.BACK_BUTTON}
            onPress={viewModel.navigateBack}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderStrong,
              },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
          <View style={styles.headerTextGroup}>
            <Text variant="xl" weight="bold" color={colors.textPrimary}>
              {t("roulette.title")}
            </Text>
            <Text variant="xs" color={colors.textSecondary}>
              {t("roulette.subtitle")}
            </Text>
          </View>
        </View>

        <Text variant="sm" weight="bold" color={colors.textPrimary} style={styles.sectionTitle}>
          {t("roulette.pickTopics")}
        </Text>

        <View style={[styles.topicsWrap, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {ROULETTE_TOPICS.map((topic) => {
            const isSelected = viewModel.selectedTopic === topic.value;
            return (
              <Pressable
                key={topic.id}
                testID={CHAT_ROULETTE_TEST_IDS.TOPIC_CHIP(topic.id)}
                disabled={viewModel.isScanning}
                onPress={() => viewModel.setSelectedTopic(topic.value)}
                style={({ pressed }) => [
                  styles.topicChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.borderStrong,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  variant="xs"
                  weight="bold"
                  color={isSelected ? colors.textOnPrimary : colors.textSecondary}
                >
                  {t(topic.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <RadarPulse isScanning={viewModel.isScanning} isMatched={Boolean(viewModel.matchedRoom)} />

        {viewModel.isScanning ? (
          <View style={styles.statusContainer}>
            <Text variant="md" weight="bold" color={colors.accent} centered>
              {t("roulette.searchingTitle")}
            </Text>
            <Text variant="xs" color={colors.textSecondary} centered>
              {t("roulette.searchingSubtitle")}
            </Text>
          </View>
        ) : null}

        {viewModel.matchedRoom ? (
          <MatchRevealCard
            match={viewModel.matchedRoom}
            onEnterRoom={viewModel.enterMatchedRoom}
            onSpinAgain={viewModel.startMatching}
          />
        ) : (
          <View style={styles.footerCta}>
            {viewModel.isScanning ? (
              <Button
                testID={CHAT_ROULETTE_TEST_IDS.CANCEL_BUTTON}
                label={t("roulette.cancelSearch")}
                variant="outline"
                onPress={viewModel.cancelMatching}
              />
            ) : (
              <Button
                testID={CHAT_ROULETTE_TEST_IDS.START_BUTTON}
                label={t("roulette.startMatching")}
                gradient={gradients.primary}
                icon={<Ionicons name="radio-outline" size={18} color={colors.textOnPrimary} />}
                onPress={viewModel.startMatching}
              />
            )}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
});

ChatRouletteContentView.displayName = "ChatRouletteContentView";

const ChatRouletteContentContainer = memo<{ readonly testID?: string }>(({ testID }) => (
  <ChatRouletteContentView viewModel={useChatRouletteViewModel()} testID={testID} />
));

ChatRouletteContentContainer.displayName = "ChatRouletteContentContainer";

export const ChatRouletteContent = memo<ChatRouletteContentProps>(
  ({ testID = CHAT_ROULETTE_TEST_IDS.ROOT, viewModel }) =>
    viewModel ? (
      <ChatRouletteContentView viewModel={viewModel} testID={testID} />
    ) : (
      <ChatRouletteContentContainer testID={testID} />
    )
);

ChatRouletteContent.displayName = "ChatRouletteContent";
