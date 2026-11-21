/** @format */

import { devtools } from "@csark0812/zustand-expo-devtools";
import * as Localization from "expo-localization";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { eventModule } from "@/src/di/modules/eventModule";
import { LanguageChangedEvent } from "@/src/domain/events";
import { directionFromLangTag } from "@/src/infrastructure/i18n/direction";
import { resolveLangCode } from "@/src/infrastructure/i18n/resolve-lang";
import { zustandMMKVStorage } from "@/src/infrastructure/storage/ZustandMMKVAdapter";
import { useDirectionStore } from "@stores/useDirectionStore";

import { readPersistedField } from "./utils/persistedState";

const LANG_KEY = "chat_roulette_language_preference";

export interface LanguageState {
  languageTag: string;
  isLoading: boolean;
  isInitialized: boolean;

  loadLanguage: () => Promise<void>;
  setLanguageTag: (tag: string) => Promise<void>;
  toggleLanguage: () => void;
  clearLanguage: () => void;
}

export function getSystemLanguageTag(): string {
  try {
    const locales: readonly { readonly languageTag?: string }[] = Localization.getLocales();
    const tag = locales[0]?.languageTag;
    if (!tag) return "en";
    return tag.split("-")[0] ?? tag;
  } catch {
    return "en";
  }
}

export const useLanguageStore = create<LanguageState>()(
  devtools(
    persist(
      (set, get) => ({
        languageTag: "en",
        isLoading: false,
        isInitialized: false,

        loadLanguage: async () => {
          const candidate = await readPersistedField(LANG_KEY + "_v1", "languageTag");
          const savedTag =
            typeof candidate === "string" && candidate.trim() !== "" ? candidate.trim() : "";
          const desiredTag = (savedTag || get().languageTag || "en").toLowerCase();

          set({ languageTag: desiredTag, isInitialized: true }, false, "initializeLanguage_setTag");
          void eventModule
            .getEventBus()
            .publish(new LanguageChangedEvent(resolveLangCode(desiredTag)));

          const expectedDir = directionFromLangTag(desiredTag);
          if (useDirectionStore.getState().direction !== expectedDir) {
            await useDirectionStore.getState().setDirection(expectedDir);
          }
        },

        setLanguageTag: async (tag: string) => {
          const normalized = (tag || "en").toLowerCase();
          set({ languageTag: normalized }, false, "setLanguageTag");
          void eventModule
            .getEventBus()
            .publish(new LanguageChangedEvent(resolveLangCode(normalized)));
          await useDirectionStore.getState().setDirection(directionFromLangTag(normalized));

          try {
            const stateToPersist = JSON.stringify({
              state: { languageTag: normalized },
              version: 0,
            });
            await zustandMMKVStorage.setItem(LANG_KEY + "_v1", stateToPersist);
          } catch {}
        },

        toggleLanguage: () => {
          const current = resolveLangCode(get().languageTag);
          const next = current === "en" ? "ar" : "en";
          void get().setLanguageTag(next);
        },

        clearLanguage: () => {
          void zustandMMKVStorage.removeItem(LANG_KEY + "_v1");
          set({ languageTag: "en" }, false, "clearLanguage");
          void useDirectionStore.getState().setDirection("ltr");
        },
      }),
      {
        name: LANG_KEY + "_v1",
        storage: createJSONStorage(() => zustandMMKVStorage),
        partialize: (state) => ({ languageTag: state.languageTag }),
        onRehydrateStorage: () => () => {
          useLanguageStore.setState({ isInitialized: true });
        },
      }
    ),
    { name: "LanguageStore" }
  )
);
