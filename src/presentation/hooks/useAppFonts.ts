/** @format */

import { useFonts } from "expo-font";

const FONTS = {
  TajawalBold: require("@assets/fonts/Tajawal-Bold.ttf") as number,
  TajawalLight: require("@assets/fonts/Tajawal-Light.ttf") as number,
  TajawalMedium: require("@assets/fonts/Tajawal-Medium.ttf") as number,
  TajawalRegular: require("@assets/fonts/Tajawal-Regular.ttf") as number,
} as const;

export function useAppFonts() {
  const [loaded, error] = useFonts(FONTS);

  return { loaded, error } as const;
}
