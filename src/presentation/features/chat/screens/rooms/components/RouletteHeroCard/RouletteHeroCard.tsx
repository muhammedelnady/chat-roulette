/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Button, PulseDot, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import { EASE_IN_OUT, gradients } from "@/src/presentation/theme";

import { styles } from "./RouletteHeroCard.styles";
import type { RouletteHeroCardProps } from "./RouletteHeroCard.types";

export const RouletteHeroCard = memo<RouletteHeroCardProps>(
  ({ onlineCount, isActive = true, onSpinPress, testID = "roulette-hero-card" }) => {
    const { colors, shadows, isDark, t } = useUI();
    const reducedMotion = useReducedMotion();
    const orbit = useSharedValue(0);

    useEffect(() => {
      cancelAnimation(orbit);
      if (isActive && !reducedMotion) {
        orbit.set(0);
        orbit.set(withRepeat(withTiming(1, { duration: 3600, easing: EASE_IN_OUT }), -1, true));
      } else {
        orbit.set(0);
      }

      return () => {
        cancelAnimation(orbit);
      };
    }, [isActive, orbit, reducedMotion]);

    const outerOrbitStyle = useAnimatedStyle(() => {
      const progress = orbit.get();
      return {
        transform: [{ scale: interpolate(progress, [0, 1], [1, 1.06], Extrapolation.CLAMP) }],
        opacity: interpolate(progress, [0, 1], [0.6, 0.95], Extrapolation.CLAMP),
      };
    });

    const innerOrbitStyle = useAnimatedStyle(() => {
      const progress = orbit.get();
      return {
        transform: [{ scale: interpolate(progress, [0, 1], [1.04, 0.96], Extrapolation.CLAMP) }],
        opacity: interpolate(progress, [0, 1], [0.9, 0.55], Extrapolation.CLAMP),
      };
    });

    const buttonIcon = useMemo(
      () => <Ionicons name="shuffle" size={18} color={colors.textOnPrimary} />,
      [colors.textOnPrimary]
    );

    const cardGradient = isDark ? gradients.midnightHero : gradients.lightHero;

    return (
      <View
        testID={testID}
        style={[
          styles.wrapper,
          shadows.lg,
          {
            borderColor: colors.borderGlow,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View style={styles.cardInner}>
          <LinearGradient
            colors={cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View pointerEvents="none" style={styles.orbitalCluster}>
              <Animated.View
                style={[
                  styles.orbitalRingOuter,
                  { borderColor: colors.borderGlow, backgroundColor: colors.primaryTint2 },
                  outerOrbitStyle,
                ]}
              />
              <Animated.View
                style={[
                  styles.orbitalRingInner,
                  { borderColor: colors.accentBorder, backgroundColor: colors.primaryTint },
                  innerOrbitStyle,
                ]}
              />
            </View>

            <View style={styles.topRow}>
              <View
                style={[
                  styles.liveBadge,
                  {
                    backgroundColor: colors.accentTint,
                    borderColor: colors.accentBorder,
                  },
                ]}
              >
                <PulseDot
                  color={colors.success}
                  haloColor={colors.successTint}
                  size={7}
                  haloSize={13}
                  active={isActive}
                />
                <Text variant="xs" weight="bold" color={colors.accent} style={styles.tabular}>
                  {t("rooms.liveNow")} · {t("rooms.membersOnline", { count: onlineCount })}
                </Text>
              </View>

              <View
                style={[
                  styles.sparkleMedallion,
                  { backgroundColor: colors.primaryTint, borderColor: colors.borderGlow },
                ]}
              >
                <Ionicons name="sparkles" size={16} color={colors.accent} />
              </View>
            </View>

            <Text variant="2xl" weight="bold" color={colors.textPrimary} style={styles.title}>
              {t("rooms.rouletteHeroTitle")}
            </Text>
            <Text variant="sm" color={colors.textSecondary} style={styles.subtitle}>
              {t("rooms.rouletteHeroSubtitle")}
            </Text>

            <View style={styles.featuresRow}>
              <View
                style={[
                  styles.featurePill,
                  {
                    backgroundColor: colors.surfaceGlass,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons name="flash-outline" size={12} color={colors.accent} />
                <Text variant="xs" weight="medium" color={colors.textPrimary}>
                  {t("rooms.heroFeatureInstant")}
                </Text>
              </View>
              <View
                style={[
                  styles.featurePill,
                  {
                    backgroundColor: colors.surfaceGlass,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons name="mic-outline" size={12} color={colors.primary} />
                <Text variant="xs" weight="medium" color={colors.textPrimary}>
                  {t("rooms.heroFeatureVoice")}
                </Text>
              </View>
              <View
                style={[
                  styles.featurePill,
                  {
                    backgroundColor: colors.surfaceGlass,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons name="layers-outline" size={12} color={colors.success} />
                <Text variant="xs" weight="medium" color={colors.textPrimary}>
                  {t("rooms.heroFeatureOffline")}
                </Text>
              </View>
            </View>

            <Button
              testID="spin-roulette-cta"
              label={t("rooms.spinRoulette")}
              gradient={gradients.primary}
              size="md"
              icon={buttonIcon}
              onPress={onSpinPress}
            />
          </LinearGradient>
        </View>
      </View>
    );
  }
);

RouletteHeroCard.displayName = "RouletteHeroCard";
