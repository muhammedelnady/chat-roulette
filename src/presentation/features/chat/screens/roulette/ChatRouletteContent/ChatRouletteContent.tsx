/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";

import { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";
import { AnimatedPressable, Button, PulseDot, Text } from "@/src/presentation/components/atoms";
import { PageLayout } from "@/src/presentation/components/templates";
import { useHaptics, useScreenFocused, useUI } from "@/src/presentation/hooks";
import {
  CSS_EASE_OUT,
  FADE_DOWN_ENTER,
  FADE_DOWN_EXIT,
  gradients,
  MOTION_DURATION,
  SOFT_POP_ENTER,
  SOFT_POP_EXIT,
} from "@/src/presentation/theme";

import { MatchRevealCard, RadarPulse } from "../components";

import { CHAT_ROULETTE_TEST_IDS, ROULETTE_TOPICS } from "./ChatRouletteContent.constants";
import { styles } from "./ChatRouletteContent.styles";
import type { ChatRouletteContentProps, ChatRouletteViewModel } from "./ChatRouletteContent.types";
import { useChatRouletteViewModel } from "./ChatRouletteContent.viewmodel";

const TOPIC_CHIP_TRANSITION = ["transform", "opacity", "backgroundColor", "borderColor"] as const;

const ChatRouletteContentView = memo<{
  readonly viewModel: ChatRouletteViewModel;
  readonly testID?: string;
}>(({ viewModel, testID = CHAT_ROULETTE_TEST_IDS.ROOT }) => {
  const { colors, shadows, t, isRTL } = useUI();
  const haptics = useHaptics();
  const isScreenFocused = useScreenFocused();
  const isMatched = Boolean(viewModel.matchedRoom);

  const handleHaptics = useCallback((type: HapticFeedbackType) => haptics.trigger(type), [haptics]);

  const selectedTopicConfig = ROULETTE_TOPICS.find(
    (topic) => topic.value === viewModel.selectedTopic
  );
  const localizedTopicLabel = selectedTopicConfig
    ? t(selectedTopicConfig.labelKey)
    : viewModel.selectedTopic;

  const telemetryLabel = isMatched
    ? t("roulette.signalLocked", { topic: localizedTopicLabel })
    : viewModel.isScanning
      ? t("roulette.searchingTitle")
      : t("roulette.signalReady", { topic: localizedTopicLabel });

  return (
    <PageLayout testID={testID}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <AnimatedPressable
            testID={CHAT_ROULETTE_TEST_IDS.BACK_BUTTON}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            scaleTo={0.95}
            hitSlop={4}
            hapticType={HapticFeedbackType.Light}
            onHaptic={handleHaptics}
            onPress={viewModel.navigateBack}
            style={[
              styles.backButton,
              shadows.sm,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={20}
              color={colors.textPrimary}
            />
          </AnimatedPressable>
          <View style={styles.headerTextGroup}>
            <Text variant="xl" weight="bold" color={colors.textPrimary} style={styles.headerTitle}>
              {t("roulette.title")}
            </Text>
            <Text variant="xs" color={colors.textSecondary}>
              {t("roulette.subtitle")}
            </Text>
          </View>
        </View>

        <Text variant="xs" weight="bold" color={colors.textSecondary} style={styles.sectionTitle}>
          {t("roulette.pickTopics")}
        </Text>

        <View style={styles.topicsWrap}>
          {ROULETTE_TOPICS.map((topic) => {
            const isSelected = viewModel.selectedTopic === topic.value;
            return (
              <AnimatedPressable
                key={topic.id}
                testID={CHAT_ROULETTE_TEST_IDS.TOPIC_CHIP(topic.id)}
                accessibilityRole="button"
                accessibilityLabel={t(topic.labelKey)}
                accessibilityState={{ selected: isSelected, disabled: viewModel.isScanning }}
                disabled={viewModel.isScanning}
                hitSlop={4}
                scaleTo={0.96}
                transitionProperties={TOPIC_CHIP_TRANSITION}
                transitionDurationMs={MOTION_DURATION.fast}
                hapticType={HapticFeedbackType.Light}
                onHaptic={handleHaptics}
                onPress={() => {
                  viewModel.setSelectedTopic(topic.value);
                }}
                style={[
                  styles.topicChip,
                  isSelected ? shadows.sm : null,
                  viewModel.isScanning ? styles.topicChipDisabled : null,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={topic.icon}
                  size={14}
                  color={isSelected ? colors.textOnPrimary : colors.accent}
                />
                <Text
                  variant="xs"
                  weight="bold"
                  color={isSelected ? colors.textOnPrimary : colors.textSecondary}
                >
                  {t(topic.labelKey)}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>

        <Animated.View
          accessibilityLiveRegion="polite"
          style={[
            styles.telemetryPill,
            {
              backgroundColor: isMatched ? colors.successTint : colors.accentTint,
              borderColor: isMatched ? colors.successBorder : colors.accentBorder,
              transitionProperty: ["backgroundColor", "borderColor"],
              transitionDuration: MOTION_DURATION.fast,
              transitionTimingFunction: CSS_EASE_OUT,
            },
          ]}
        >
          <PulseDot
            color={
              isMatched ? colors.success : viewModel.isScanning ? colors.accent : colors.primary
            }
            size={7}
            haloSize={11}
            active={viewModel.isScanning && isScreenFocused}
          />
          <Text variant="xs" weight="bold" color={isMatched ? colors.success : colors.accent}>
            {telemetryLabel}
          </Text>
        </Animated.View>

        <RadarPulse
          isScanning={viewModel.isScanning}
          isMatched={isMatched}
          isActive={isScreenFocused}
        />

        {viewModel.isScanning ? (
          <Animated.View
            entering={FADE_DOWN_ENTER}
            exiting={FADE_DOWN_EXIT}
            style={styles.statusContainer}
          >
            <Text variant="md" weight="bold" color={colors.accent} centered>
              {t("roulette.searchingTitle")}
            </Text>
            <Text variant="xs" color={colors.textSecondary} centered>
              {t("roulette.searchingSubtitle")}
            </Text>
          </Animated.View>
        ) : null}

        {viewModel.error && !viewModel.isScanning && !viewModel.matchedRoom ? (
          <Animated.View
            testID={CHAT_ROULETTE_TEST_IDS.ERROR_BANNER}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            entering={FADE_DOWN_ENTER}
            exiting={FADE_DOWN_EXIT}
            style={[
              styles.errorBanner,
              { backgroundColor: colors.errorTint, borderColor: colors.errorBorder },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text variant="xs" weight="medium" color={colors.error} style={styles.errorText}>
              {viewModel.error}
            </Text>
          </Animated.View>
        ) : null}

        {viewModel.matchedRoom ? (
          <MatchRevealCard
            key={viewModel.matchedRoom.id}
            match={viewModel.matchedRoom}
            onEnterRoom={viewModel.enterMatchedRoom}
            onSpinAgain={viewModel.startMatching}
          />
        ) : (
          <View style={styles.footerCta}>
            {viewModel.isScanning ? (
              <Animated.View key="cancel-cta" entering={SOFT_POP_ENTER} exiting={SOFT_POP_EXIT}>
                <Button
                  testID={CHAT_ROULETTE_TEST_IDS.CANCEL_BUTTON}
                  label={t("roulette.cancelSearch")}
                  variant="outline"
                  onPress={viewModel.cancelMatching}
                />
              </Animated.View>
            ) : (
              <Animated.View key="start-cta" entering={SOFT_POP_ENTER} exiting={SOFT_POP_EXIT}>
                <Button
                  testID={CHAT_ROULETTE_TEST_IDS.START_BUTTON}
                  label={viewModel.error ? t("common.retry") : t("roulette.startMatching")}
                  gradient={gradients.primary}
                  icon={<Ionicons name="radio-outline" size={18} color={colors.textOnPrimary} />}
                  onPress={viewModel.startMatching}
                />
              </Animated.View>
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
