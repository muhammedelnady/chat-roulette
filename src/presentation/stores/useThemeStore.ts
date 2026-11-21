/** @format */

import { devtools } from "@csark0812/zustand-expo-devtools";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandMMKVStorage } from "@/src/infrastructure/storage/ZustandMMKVAdapter";

import { devtoolsConfig } from "./utils/devtools";
import { readPersistedField } from "./utils/persistedState";

const THEME_KEY = "chat_roulette_theme_preference";
export type ThemeMode = "light" | "dark";

export interface ThemeState {
  theme: ThemeMode;
  isLoading: boolean;
  isInitialized: boolean;

  loadTheme: () => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  clearTheme: () => void;
}

function getSystemTheme(): ThemeMode {
  return Appearance.getColorScheme() === "light" ? "light" : "dark";
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: "dark",
        isLoading: false,
        isInitialized: false,

        loadTheme: async () => {
          const savedTheme = await readPersistedField(THEME_KEY + "_v1", "theme");
          if (savedTheme === "light" || savedTheme === "dark") {
            set({ theme: savedTheme }, false, "loadTheme_restored");
          }
          set({ isInitialized: true }, false, "loadTheme_initialized");
        },

        setTheme: (theme) => {
          set({ theme }, false, "setTheme");
        },

        toggleTheme: () => {
          const next: ThemeMode = get().theme === "light" ? "dark" : "light";
          get().setTheme(next);
        },

        clearTheme: () => {
          void zustandMMKVStorage.removeItem(THEME_KEY + "_v1");
          set({ theme: getSystemTheme() }, false, "clearTheme");
        },
      }),
      {
        name: THEME_KEY + "_v1",
        storage: createJSONStorage(() => zustandMMKVStorage),
        partialize: (state) => ({ theme: state.theme }),
        onRehydrateStorage: () => () => {
          useThemeStore.setState({ isInitialized: true });
        },
      }
    ),
    devtoolsConfig("ThemeStore")
  )
);
