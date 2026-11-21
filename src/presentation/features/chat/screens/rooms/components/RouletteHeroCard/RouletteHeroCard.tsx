/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { View } from "react-native";

import { Button, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import { gradients } from "@/src/presentation/theme";

import { styles } from "./RouletteHeroCard.styles";
import type { RouletteHeroCardProps } from "./RouletteHeroCard.types";

export const RouletteHeroCard = memo<RouletteHeroCardProps>(
  ({ onlineCount, onSpinPress, testID = "roulette-hero-card" }) => {
    const { colors, isDark, t, isRTL } = useUI();

    const cardGradient = isDark ? gradients.midnightHero : gradients.lightHero;

    return (
      <View
        testID={testID}
        style={[
          styles.wrapper,
          {
            borderColor: colors.borderFocused,
          },
        ]}
      >
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={[styles.topRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View
              style={[
                styles.liveBadge,
                {
                  backgroundColor: colors.cyanTint,
                  borderColor: colors.borderFocused,
                  flexDirection: isRTL ? "row-reverse" : "row",
                },
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
              <Text variant="xs" weight="bold" color={colors.accent}>
                {t("rooms.liveNow")} · {t("rooms.membersOnline", { count: onlineCount })}
              </Text>
            </View>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
          </View>

          <Text variant="xl" weight="bold" color={colors.textPrimary} style={styles.title}>
            {t("rooms.rouletteHeroTitle")}
          </Text>
          <Text variant="sm" color={colors.textSecondary} style={styles.subtitle}>
            {t("rooms.rouletteHeroSubtitle")}
          </Text>

          <Button
            testID="spin-roulette-cta"
            label={t("rooms.spinRoulette")}
            gradient={gradients.primary}
            size="md"
            icon={<Ionicons name="shuffle" size={18} color={colors.textOnPrimary} />}
            onPress={onSpinPress}
          />
        </LinearGradient>
      </View>
    );
  }
);

RouletteHeroCard.displayName = "RouletteHeroCard";
