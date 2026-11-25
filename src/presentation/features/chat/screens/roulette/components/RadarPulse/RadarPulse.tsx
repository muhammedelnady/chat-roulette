/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useUI } from "@/src/presentation/hooks";
import {
  EASE_IN_OUT,
  EASE_OUT,
  gradients,
  MOTION_DURATION,
  MOTION_SPRING,
} from "@/src/presentation/theme";

import { styles } from "./RadarPulse.styles";
import type { RadarPulseProps } from "./RadarPulse.types";

export const RadarPulse = memo<RadarPulseProps>(
  ({ isScanning, isMatched, isActive = true, testID = "radar-pulse" }) => {
    const { colors, shadows } = useUI();
    const reducedMotion = useReducedMotion();

    const pulseA = useSharedValue(0);
    const pulseB = useSharedValue(0);
    const pulseC = useSharedValue(0);
    const sweep = useSharedValue(0);
    const sweepOpacity = useSharedValue(0);
    const orbScale = useSharedValue(1);
    const haloScale = useSharedValue(1);

    useEffect(() => {
      cancelAnimation(pulseA);
      cancelAnimation(pulseB);
      cancelAnimation(pulseC);
      cancelAnimation(sweep);
      cancelAnimation(sweepOpacity);
      cancelAnimation(orbScale);
      cancelAnimation(haloScale);

      if (!isActive || reducedMotion) {
        pulseA.set(isMatched ? 0.5 : 0.25);
        pulseB.set(isMatched ? 0.5 : 0.25);
        pulseC.set(0);
        sweep.set(0);
        sweepOpacity.set(0);
        orbScale.set(1);
        haloScale.set(1);
      } else if (isScanning) {
        pulseA.set(0);
        pulseB.set(0);
        pulseC.set(0);
        sweep.set(0);

        pulseA.set(withRepeat(withTiming(1, { duration: 1800, easing: EASE_OUT }), -1, false));
        pulseB.set(
          withDelay(600, withRepeat(withTiming(1, { duration: 1800, easing: EASE_OUT }), -1, false))
        );
        pulseC.set(
          withDelay(
            1200,
            withRepeat(withTiming(1, { duration: 1800, easing: EASE_OUT }), -1, false)
          )
        );
        sweep.set(withRepeat(withTiming(1, { duration: 2200, easing: Easing.linear }), -1, false));
        sweepOpacity.set(withTiming(1, { duration: MOTION_DURATION.fast, easing: EASE_OUT }));
        orbScale.set(
          withRepeat(withTiming(1.05, { duration: 900, easing: EASE_IN_OUT }), -1, true)
        );
        haloScale.set(
          withRepeat(withTiming(1.08, { duration: 900, easing: EASE_IN_OUT }), -1, true)
        );
      } else if (isMatched) {
        pulseA.set(withTiming(0.5, { duration: 360, easing: EASE_OUT }));
        pulseB.set(withTiming(0.5, { duration: 360, easing: EASE_OUT }));
        pulseC.set(withTiming(0, { duration: 240, easing: EASE_OUT }));
        sweepOpacity.set(withTiming(0, { duration: 200, easing: EASE_OUT }));
        orbScale.set(
          withSequence(
            withTiming(0.93, { duration: 90, easing: EASE_OUT }),
            withSpring(1, MOTION_SPRING.pop)
          )
        );
        haloScale.set(
          withSequence(
            withTiming(1.14, { duration: 140, easing: EASE_OUT }),
            withSpring(1, MOTION_SPRING.settle)
          )
        );
      } else {
        pulseA.set(withTiming(0.25, { duration: 320, easing: EASE_OUT }));
        pulseB.set(withTiming(0.25, { duration: 320, easing: EASE_OUT }));
        pulseC.set(withTiming(0, { duration: 260, easing: EASE_OUT }));
        sweepOpacity.set(withTiming(0, { duration: 240, easing: EASE_OUT }));
        orbScale.set(withTiming(1, { duration: 240, easing: EASE_OUT }));
        haloScale.set(withTiming(1, { duration: 240, easing: EASE_OUT }));
      }

      return () => {
        cancelAnimation(pulseA);
        cancelAnimation(pulseB);
        cancelAnimation(pulseC);
        cancelAnimation(sweep);
        cancelAnimation(sweepOpacity);
        cancelAnimation(orbScale);
        cancelAnimation(haloScale);
      };
    }, [
      haloScale,
      isActive,
      isMatched,
      isScanning,
      orbScale,
      pulseA,
      pulseB,
      pulseC,
      reducedMotion,
      sweep,
      sweepOpacity,
    ]);

    const waveAStyle = useAnimatedStyle(() => {
      const value = pulseA.get();
      return {
        transform: [
          {
            scale:
              isActive && isScanning
                ? interpolate(value, [0, 1], [0.72, 1.18], Extrapolation.CLAMP)
                : interpolate(value, [0, 1], [0.96, 1.04], Extrapolation.CLAMP),
          },
        ],
        opacity:
          isActive && isScanning
            ? interpolate(value, [0, 1], [0.85, 0.05], Extrapolation.CLAMP)
            : isMatched
              ? 0.45
              : 0.32,
      };
    });

    const waveBStyle = useAnimatedStyle(() => {
      const value = pulseB.get();
      return {
        transform: [
          {
            scale:
              isActive && isScanning
                ? interpolate(value, [0, 1], [0.72, 1.18], Extrapolation.CLAMP)
                : interpolate(value, [0, 1], [0.92, 1], Extrapolation.CLAMP),
          },
        ],
        opacity:
          isActive && isScanning
            ? interpolate(value, [0, 1], [0.75, 0.05], Extrapolation.CLAMP)
            : isMatched
              ? 0.65
              : 0.24,
      };
    });

    const waveCStyle = useAnimatedStyle(() => {
      const value = pulseC.get();
      return {
        transform: [
          {
            scale:
              isActive && isScanning
                ? interpolate(value, [0, 1], [0.72, 1.18], Extrapolation.CLAMP)
                : 0.88,
          },
        ],
        opacity:
          isActive && isScanning
            ? interpolate(value, [0, 1], [0.65, 0.05], Extrapolation.CLAMP)
            : 0,
      };
    });

    const sweepStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${sweep.get() * 360}deg` }],
      opacity: sweepOpacity.get(),
    }));

    const orbStyle = useAnimatedStyle(() => ({
      transform: [{ scale: orbScale.get() }],
    }));

    const haloStyle = useAnimatedStyle(() => ({
      transform: [{ scale: haloScale.get() }],
    }));

    const activeColor = isMatched ? colors.success : colors.accent;
    const orbGradient = isMatched ? gradients.radarMatched : gradients.primary;

    return (
      <View testID={testID} style={styles.container}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.container}
        >
          <View style={[styles.crosshairH, { backgroundColor: colors.borderSubtle }]} />
          <View style={[styles.crosshairV, { backgroundColor: colors.borderSubtle }]} />

          <View style={[styles.telemetryRing, { borderColor: colors.border }]}>
            <View
              style={[styles.cardinalDot, styles.dotNorth, { backgroundColor: colors.borderGlow }]}
            />
            <View
              style={[styles.cardinalDot, styles.dotSouth, { backgroundColor: colors.borderGlow }]}
            />
            <View
              style={[styles.cardinalDot, styles.dotEast, { backgroundColor: colors.borderGlow }]}
            />
            <View
              style={[styles.cardinalDot, styles.dotWest, { backgroundColor: colors.borderGlow }]}
            />
          </View>

          <Animated.View
            style={[
              styles.waveRing,
              { borderColor: activeColor, backgroundColor: colors.primaryTint2 },
              waveAStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.waveRingMid,
              { borderColor: colors.primary, backgroundColor: colors.primaryTint },
              waveBStyle,
            ]}
          />
          <Animated.View style={[styles.waveRing, { borderColor: activeColor }, waveCStyle]} />

          <Animated.View style={[styles.sweepTrack, sweepStyle]}>
            <View style={[styles.sweepRing, { borderColor: colors.accentBorder }]}>
              <View
                style={[
                  styles.sweepBeacon,
                  shadows.glowAccent,
                  { backgroundColor: colors.accent, borderColor: colors.white },
                ]}
              />
            </View>
          </Animated.View>

          <Animated.View style={[styles.orbOuterHalo, { borderColor: activeColor }, haloStyle]}>
            <Animated.View
              style={[
                orbStyle,
                isMatched ? shadows.glowAccent : shadows.glowPrimary,
                { borderRadius: 44, backgroundColor: isMatched ? colors.accent : colors.primary },
              ]}
            >
              <LinearGradient
                colors={orbGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.centerOrb}
              >
                <Ionicons
                  name={isMatched ? "checkmark-done" : isScanning ? "radio" : "shuffle"}
                  size={34}
                  color={colors.textOnPrimary}
                />
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        </View>
      </View>
    );
  }
);

RadarPulse.displayName = "RadarPulse";
