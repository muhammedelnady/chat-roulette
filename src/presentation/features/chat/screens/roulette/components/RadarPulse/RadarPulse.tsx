/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useUI } from "@/src/presentation/hooks";

import { styles } from "./RadarPulse.styles";
import type { RadarPulseProps } from "./RadarPulse.types";

export const RadarPulse = memo<RadarPulseProps>(
  ({ isScanning, isMatched, testID = "radar-pulse" }) => {
    const { colors } = useUI();
    const pulse = useSharedValue(0);

    useEffect(() => {
      if (isScanning) {
        pulse.value = 0;
        pulse.value = withRepeat(
          withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }),
          -1,
          false
        );
      } else {
        pulse.value = withTiming(0, { duration: 300 });
      }
    }, [isScanning, pulse]);

    const outerStyle = useAnimatedStyle(() => ({
      transform: [{ scale: 0.85 + pulse.value * 0.25 }],
      opacity: isScanning ? 1 - pulse.value * 0.75 : 0.35,
    }));

    const middleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: 0.9 + pulse.value * 0.16 }],
      opacity: isScanning ? 0.9 - pulse.value * 0.5 : 0.55,
    }));

    const activeColor = isMatched ? colors.success : colors.accent;

    return (
      <View testID={testID} style={styles.container}>
        <Animated.View
          style={[
            styles.outerRing,
            { borderColor: activeColor, backgroundColor: colors.primaryTint2 },
            outerStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.middleRing,
            { borderColor: colors.primary, backgroundColor: colors.primaryTint },
            middleStyle,
          ]}
        />
        <View
          style={[
            styles.centerOrb,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: activeColor,
            },
          ]}
        >
          <Ionicons
            name={isMatched ? "checkmark-done" : isScanning ? "radio" : "shuffle"}
            size={34}
            color={activeColor}
          />
        </View>
      </View>
    );
  }
);

RadarPulse.displayName = "RadarPulse";
