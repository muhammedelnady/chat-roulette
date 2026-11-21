/** @format */

import { devtools } from "@csark0812/zustand-expo-devtools";
import { I18nManager } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandMMKVStorage } from "@/src/infrastructure/storage/ZustandMMKVAdapter";

import { devtoolsConfig } from "./utils/devtools";
import { readPersistedField } from "./utils/persistedState";

const DIR_KEY = "chat_roulette_direction_preference";
export type DirectionMode = "ltr" | "rtl";

export interface DirectionState {
  direction: DirectionMode;
  isLoading: boolean;
  isInitialized: boolean;

  loadDirection: () => Promise<void>;
  setDirection: (dir: DirectionMode) => Promise<void>;
  toggleDirection: () => void;
  clearDirection: () => void;
}

export const useDirectionStore = create<DirectionState>()(
  devtools(
    persist(
      (set, get) => ({
        direction: "ltr",
        isLoading: false,
        isInitialized: false,

        loadDirection: async () => {
          const savedDir = await readPersistedField(DIR_KEY + "_v1", "direction");
          if (savedDir === "rtl" || savedDir === "ltr") {
            set({ direction: savedDir }, false, "loadDirection_fromStorage");
          }
          I18nManager.allowRTL(true);
          set({ isInitialized: true }, false, "initializeDirection_setInit");
        },

        setDirection: async (dir) => {
          set({ direction: dir }, false, "setDirection");
          I18nManager.allowRTL(true);
          await Promise.resolve();
        },

        toggleDirection: () => {
          const next: DirectionMode = get().direction === "ltr" ? "rtl" : "ltr";
          void get().setDirection(next);
        },

        clearDirection: () => {
          void zustandMMKVStorage.removeItem(DIR_KEY + "_v1");
          set({ direction: "ltr" }, false, "clearDirection");
        },
      }),
      {
        name: DIR_KEY + "_v1",
        storage: createJSONStorage(() => zustandMMKVStorage),
        partialize: (state) => ({ direction: state.direction }),
        onRehydrateStorage: () => () => {
          useDirectionStore.setState({ isInitialized: true });
        },
      }
    ),
    devtoolsConfig("DirectionStore")
  )
);
