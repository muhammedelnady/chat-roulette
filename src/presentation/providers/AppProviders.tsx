/** @format */

import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { QueryProvider } from "@/src/infrastructure/query";
import { ErrorBoundary } from "@/src/presentation/components/error-boundary";
import { useConnectivityStore } from "@/src/presentation/stores/useConnectivityStore";
import { useDirectionStore } from "@/src/presentation/stores/useDirectionStore";
import { useThemeStore } from "@/src/presentation/stores/useThemeStore";
import { colors } from "@/src/presentation/theme";

import { AppUseCasesProvider } from "./AppUseCasesProvider";

export interface AppProvidersProps {
  readonly children: ReactNode;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export function AppProviders({ children }: AppProvidersProps) {
  const direction = useDirectionStore((s) => s.direction);
  const themeMode = useThemeStore((s) => s.theme);
  const isDark = themeMode === "dark";

  useEffect(() => {
    const unsub = useConnectivityStore.getState().subscribe();
    return unsub;
  }, []);

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.dark.background,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.light.background,
    },
  };

  const currentTheme = isDark ? customDarkTheme : customLightTheme;

  return (
    <QueryProvider>
      <AppUseCasesProvider>
        <KeyboardProvider>
          <ErrorBoundary>
            <GestureHandlerRootView
              style={[styles.root, { direction, backgroundColor: colors[themeMode].background }]}
            >
              <StatusBar style={isDark ? "light" : "dark"} />
              <ThemeProvider value={currentTheme}>{children}</ThemeProvider>
            </GestureHandlerRootView>
          </ErrorBoundary>
        </KeyboardProvider>
      </AppUseCasesProvider>
    </QueryProvider>
  );
}
