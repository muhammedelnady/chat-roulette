/** @format */

import * as SplashScreen from "expo-splash-screen";

import { initStorage } from "@/src/infrastructure/storage/mmkvStorage";

let bootstrapped = false;

export function bootstrapApp(): void {
  if (bootstrapped) {
    return;
  }
  bootstrapped = true;

  void SplashScreen.preventAutoHideAsync().catch(() => {});
  void initStorage().catch(() => {});
}

export async function ensureStorageInitialized(): Promise<void> {
  await initStorage();
}
