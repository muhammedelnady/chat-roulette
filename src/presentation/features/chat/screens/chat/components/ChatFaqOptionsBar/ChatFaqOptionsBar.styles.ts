/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingTop: 9,
    paddingBottom: 9,
    borderTopWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 7,
    gap: 6,
  },
  eyebrowIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrowText: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  chipIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
