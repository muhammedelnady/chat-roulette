/** @format */

import * as SplashScreen from "expo-splash-screen";

import { initStorage } from "@/src/data/cache/mmkvStorage";

let bootstrapped = false;

export function bootstrapApp(): void {
  if (bootstrapped) {
    return;
  }
  bootstrapped = true;

  void SplashScreen.preventAutoHideAsync();
  void initStorage();
}
