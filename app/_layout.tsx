/** @format */

import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { bootstrapApp } from "@/src/di/bootstrap";
import { useAppInitialization } from "@/src/presentation/hooks/useAppInitialization";
import { AppProviders } from "@/src/presentation/providers";
import { useDirectionStore } from "@/src/presentation/stores/useDirectionStore";

LogBox.ignoreLogs([
  "has a shadow set but cannot calculate shadow efficiently",
  "[Reanimated] Dependencies should only be used on the web",
  "(ADVICE)",
  "[Reanimated] Reduced motion setting is overwritten",
]);

if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const firstArg = typeof args[0] === "string" ? args[0] : "";
    if (
      firstArg.includes("has a shadow set but cannot calculate shadow efficiently") ||
      firstArg.includes("[Reanimated] Dependencies should only be used on the web") ||
      firstArg.includes("(ADVICE)")
    ) {
      return;
    }
    originalWarn(...args);
  };
}

bootstrapApp();

function RootStack() {
  const direction = useDirectionStore((s) => s.direction);
  const reducedMotion = useReducedMotion();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reducedMotion
          ? "fade"
          : direction === "rtl"
            ? "slide_from_left"
            : "slide_from_right",
        animationMatchesGesture: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="rooms/index" />
      <Stack.Screen
        name="rooms/roulette"
        options={{ presentation: "modal", animation: reducedMotion ? "fade" : "default" }}
      />
      <Stack.Screen name="rooms/[conversationId]" />
    </Stack>
  );
}

export default function RootLayout() {
  const { isReady } = useAppInitialization();

  if (!isReady) return null;

  return (
    <AppProviders>
      <RootStack />
    </AppProviders>
  );
}
