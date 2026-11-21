/** @format */

import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
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

import { EASE_OUT } from "@theme";

export interface PulseDotProps {
  readonly color: string;
  readonly haloColor?: string;
  readonly size?: number;
  readonly haloSize?: number;
  readonly active?: boolean;
  readonly testID?: string;
}

export const PulseDot = memo<PulseDotProps>(
  ({ color, haloColor, size = 7, haloSize = 13, active = true, testID }) => {
    const reducedMotion = useReducedMotion();
    const pulse = useSharedValue(0);

    useEffect(() => {
      cancelAnimation(pulse);
      if (active && !reducedMotion) {
        pulse.set(0);
        pulse.set(withRepeat(withTiming(1, { duration: 1800, easing: EASE_OUT }), -1, false));
      } else {
        pulse.set(0);
      }

      return () => {
        cancelAnimation(pulse);
      };
    }, [active, pulse, reducedMotion]);

    const ringStyle = useAnimatedStyle(() => {
      const progress = pulse.get();
      return {
        transform: [{ scale: interpolate(progress, [0, 1], [0.85, 1.85], Extrapolation.CLAMP) }],
        opacity: !active
          ? 0
          : reducedMotion
            ? 0.55
            : interpolate(progress, [0, 0.7, 1], [0.75, 0.25, 0], Extrapolation.CLAMP),
      };
    });

    return (
      <View
        testID={testID}
        style={[
          styles.container,
          {
            width: haloSize,
            height: haloSize,
          },
        ]}
      >
        {haloColor ? (
          <View
            style={[
              styles.halo,
              {
                width: haloSize,
                height: haloSize,
                borderRadius: haloSize / 2,
                backgroundColor: haloColor,
              },
            ]}
          />
        ) : null}
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
            ringStyle,
          ]}
        />
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
      </View>
    );
  }
);

PulseDot.displayName = "PulseDot";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
  },
  ring: {
    position: "absolute",
  },
});
