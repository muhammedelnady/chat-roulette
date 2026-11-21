/** @format */

import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

function normalizeAppState(value: string | null | undefined): AppStateStatus {
  if (
    value === "active" ||
    value === "background" ||
    value === "inactive" ||
    value === "extension" ||
    value === "unknown"
  ) {
    return value;
  }
  return "active";
}

export function useScreenFocused(): boolean {
  const [isFocused, setIsFocused] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(() =>
    normalizeAppState(AppState.currentState)
  );

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      setAppState(normalizeAppState(nextState));
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return isFocused && appState === "active";
}
