/** @format */

import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";

import { ensureStorageInitialized } from "@/src/di/bootstrap";
import { log } from "@/src/infrastructure/logging/logger";
import { useAppFonts } from "@presentation/hooks/useAppFonts";
import { useDirectionStore } from "@stores/useDirectionStore";
import { useLanguageStore } from "@stores/useLanguageStore";
import { useThemeStore } from "@stores/useThemeStore";

export function useAppInitialization() {
  const { loaded: fontsLoaded, error: fontError } = useAppFonts();
  const themeInitialized = useThemeStore((s) => s.isInitialized);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const dirInitialized = useDirectionStore((s) => s.isInitialized);
  const loadDirection = useDirectionStore((s) => s.loadDirection);
  const langInitialized = useLanguageStore((s) => s.isInitialized);
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);

  const didInit = useRef(false);
  const [isForceReady, setIsForceReady] = useState(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void ensureStorageInitialized()
      .then(() => Promise.all([loadTheme(), loadDirection(), loadLanguage()]))
      .catch((error: unknown) => {
        log.error("Initialization failed:", error);
      });
  }, [loadTheme, loadDirection, loadLanguage]);

  useEffect(() => {
    if (fontError) {
      log.warn("Font load error:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsForceReady(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const isReady =
    isForceReady ||
    ((fontsLoaded || Boolean(fontError)) && themeInitialized && dirInitialized && langInitialized);

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  return { isReady };
}
