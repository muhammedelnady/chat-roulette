/** @format */

import type { TypographyTokens } from "./types";

export const typography: TypographyTokens = {
  fontFamily: {
    regular: "TajawalRegular",
    medium: "TajawalMedium",
    semiBold: "TajawalMedium",
    bold: "TajawalBold",
  },
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.7,
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
  },
  screenTitle: { fontSize: 16, fontWeight: "600", lineHeight: 22 },
  h2: { fontSize: 15, fontWeight: "600", lineHeight: 20 },
  h3: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
  body: { fontSize: 13, fontWeight: "400", lineHeight: 19 },
  sm: { fontSize: 12, fontWeight: "400", lineHeight: 16 },
  xs: { fontSize: 10, fontWeight: "400", lineHeight: 14 },
  label: { fontSize: 10, fontWeight: "600", lineHeight: 14, textTransform: "uppercase" },
  mono: { fontSize: 12, fontWeight: "500", lineHeight: 17, fontFamily: "TajawalMedium" },
};
