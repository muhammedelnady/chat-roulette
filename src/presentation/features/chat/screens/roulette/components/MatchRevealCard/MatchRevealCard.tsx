/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { View } from "react-native";

import { Button, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import { gradients } from "@/src/presentation/theme";

import { styles } from "./MatchRevealCard.styles";
import type { MatchRevealCardProps } from "./MatchRevealCard.types";

export const MatchRevealCard = memo<MatchRevealCardProps>(
  ({ match, onEnterRoom, onSpinAgain, testID = "match-reveal-card" }) => {
    const { colors, t, isRTL } = useUI();

    return (
      <View
        testID={testID}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderFocused,
          },
        ]}
      >
        <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.successTint,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
            ]}
          >
            <Ionicons name="sparkles" size={13} color={colors.success} />
            <Text variant="xs" weight="bold" color={colors.success}>
              {t("roulette.matchScore")}
            </Text>
          </View>
          <Text variant="xs" color={colors.accent} weight="bold">
            {match.topic ?? t("roulette.matchFound")}
          </Text>
        </View>

        <View>
          <Text variant="xl" weight="bold" color={colors.textPrimary}>
            {match.subject}
          </Text>
          <Text variant="sm" color={colors.textSecondary}>
            {[match.partnerRole, match.partnerLocation].filter(Boolean).join(" · ")}
          </Text>
        </View>

        {match.icebreaker ? (
          <View
            style={[
              styles.icebreakerBox,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderStrong,
              },
            ]}
          >
            <Text variant="xs" weight="bold" color={colors.accent}>
              {t("roulette.icebreakerLabel")}
            </Text>
            <Text variant="sm" color={colors.textPrimary}>
              {match.icebreaker}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            testID="enter-matched-room-cta"
            label={t("roulette.enterRoom")}
            gradient={gradients.primary}
            onPress={onEnterRoom}
          />
          <Button
            testID="spin-again-cta"
            label={t("roulette.spinAgain")}
            variant="outline"
            onPress={onSpinAgain}
          />
        </View>
      </View>
    );
  }
);

MatchRevealCard.displayName = "MatchRevealCard";
