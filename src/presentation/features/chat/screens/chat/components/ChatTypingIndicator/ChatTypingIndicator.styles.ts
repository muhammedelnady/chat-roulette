/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    alignItems: "flex-start",
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: 9,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
  },
});
