/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
    marginBottom: 14,
  },
  cardInner: {
    borderRadius: 23,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  gradient: {
    padding: 18,
  },
  orbitalCluster: {
    position: "absolute",
    top: -42,
    end: -38,
    width: 148,
    height: 148,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitalRingOuter: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
  },
  orbitalRingInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  tabular: {
    fontVariant: ["tabular-nums"],
  },
  sparkleMedallion: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 12,
    lineHeight: 19,
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    gap: 5,
  },
});
