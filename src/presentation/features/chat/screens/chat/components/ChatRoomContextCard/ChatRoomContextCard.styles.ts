/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: "continuous",
    overflow: "hidden",
    flexDirection: "row",
  },
  accentRail: {
    width: 3,
    alignSelf: "stretch",
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  topicRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  topicIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  topicText: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabular: {
    fontVariant: ["tabular-nums"],
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 10,
  },
  icebreakerText: {
    flex: 1,
    lineHeight: 17,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
  },
});
