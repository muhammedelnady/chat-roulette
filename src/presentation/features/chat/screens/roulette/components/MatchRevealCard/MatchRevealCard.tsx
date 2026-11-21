/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { Button, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import {
  gradients,
  MATCH_REVEAL_ENTER,
  MATCH_REVEAL_EXIT,
  MATCH_STAGGER_1,
  MATCH_STAGGER_2,
  MATCH_STAGGER_3,
} from "@/src/presentation/theme";

import { getInitials } from "../../../../shared/utils/text";
import { ROULETTE_TOPICS } from "../../ChatRouletteContent/ChatRouletteContent.constants";

import { styles } from "./MatchRevealCard.styles";
import type { MatchRevealCardProps } from "./MatchRevealCard.types";

export const MatchRevealCard = memo<MatchRevealCardProps>(
  ({ match, onEnterRoom, onSpinAgain, testID = "match-reveal-card" }) => {
    const { colors, shadows, isDark, t } = useUI();
    const displayName = match.subject ?? t("roulette.matchFound");
    const initials = useMemo(() => getInitials(displayName), [displayName]);
    const bannerGradient = isDark ? gradients.matchBannerDark : gradients.matchBannerLight;

    const topicConfig = ROULETTE_TOPICS.find((item) => item.value === match.topic);
    const topicLabel = topicConfig
      ? t(topicConfig.labelKey)
      : (match.topic ?? t("roulette.matchFound"));

    return (
      <Animated.View
        testID={testID}
        accessibilityLiveRegion="polite"
        entering={MATCH_REVEAL_ENTER}
        exiting={MATCH_REVEAL_EXIT}
        style={[
          styles.card,
          shadows.lg,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderGlow,
          },
        ]}
      >
        <View style={styles.cardInner}>
          <LinearGradient
            colors={bannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.bannerRow,
              {
                borderBottomColor: colors.borderSubtle,
              },
            ]}
          >
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.successTint,
                  borderColor: colors.successBorder,
                },
              ]}
            >
              <Ionicons name="sparkles" size={12} color={colors.success} />
              <Text variant="xs" weight="bold" color={colors.success}>
                {t("roulette.matchScore")}
              </Text>
            </View>
            <View
              style={[
                styles.topicPill,
                { backgroundColor: colors.accentTint, borderColor: colors.accentBorder },
              ]}
            >
              <Text variant="xs" weight="bold" color={colors.accent}>
                {topicLabel}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            <Animated.View entering={MATCH_STAGGER_1} style={styles.identityRow}>
              <View style={styles.avatarWrap}>
                <LinearGradient
                  colors={gradients.radarGlow}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text variant="lg" weight="bold" color={colors.textOnPrimary}>
                    {initials}
                  </Text>
                </LinearGradient>
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={[
                    styles.onlineDot,
                    { backgroundColor: colors.success, borderColor: colors.surface },
                  ]}
                />
              </View>

              <View style={styles.identityMeta}>
                <Text variant="xl" weight="bold" color={colors.textPrimary} numberOfLines={1}>
                  {displayName}
                </Text>
                <View style={styles.metaPills}>
                  {match.partnerRole ? (
                    <View
                      style={[
                        styles.metaChip,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <Ionicons name="briefcase-outline" size={11} color={colors.primary} />
                      <Text variant="xs" color={colors.textSecondary} numberOfLines={1}>
                        {match.partnerRole}
                      </Text>
                    </View>
                  ) : null}
                  {match.partnerLocation ? (
                    <View
                      style={[
                        styles.metaChip,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <Ionicons name="location-outline" size={11} color={colors.accent} />
                      <Text variant="xs" color={colors.textSecondary} numberOfLines={1}>
                        {match.partnerLocation}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Animated.View>

            {match.icebreaker ? (
              <Animated.View
                entering={MATCH_STAGGER_2}
                style={[
                  styles.icebreakerBox,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={[styles.icebreakerBar, { backgroundColor: colors.accent }]} />
                <View style={styles.icebreakerContent}>
                  <Text
                    variant="xs"
                    weight="bold"
                    color={colors.accent}
                    style={styles.icebreakerLabel}
                  >
                    {t("roulette.icebreakerLabel")}
                  </Text>
                  <Text variant="sm" color={colors.textPrimary} style={styles.icebreakerText}>
                    {match.icebreaker}
                  </Text>
                </View>
              </Animated.View>
            ) : null}

            <Animated.View entering={MATCH_STAGGER_3} style={styles.actions}>
              <Button
                testID="enter-matched-room-cta"
                label={t("roulette.enterRoom")}
                gradient={gradients.primary}
                icon={
                  <Ionicons name="chatbubbles-outline" size={18} color={colors.textOnPrimary} />
                }
                onPress={onEnterRoom}
              />
              <Button
                testID="spin-again-cta"
                label={t("roulette.spinAgain")}
                variant="outline"
                icon={<Ionicons name="refresh-outline" size={17} color={colors.primary} />}
                onPress={onSpinAgain}
              />
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    );
  }
);

MatchRevealCard.displayName = "MatchRevealCard";
