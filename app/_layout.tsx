/** @format */

import { Stack } from "expo-router";

import { bootstrapApp } from "@/src/di/bootstrap";
import { useAppInitialization } from "@/src/presentation/hooks/useAppInitialization";
import { AppProviders } from "@/src/presentation/providers";

bootstrapApp();

export default function RootLayout() {
  const { isReady } = useAppInitialization();

  if (!isReady) return null;

  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 220,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="rooms/index" />
        <Stack.Screen name="rooms/roulette" options={{ presentation: "modal" }} />
        <Stack.Screen name="rooms/[conversationId]" />
      </Stack>
    </AppProviders>
  );
}
