/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  cardInner: {
    borderRadius: 23,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    gap: 5,
  },
  topicPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  body: {
    padding: 16,
    gap: 14,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    bottom: -2,
    end: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  identityMeta: {
    flex: 1,
    gap: 5,
  },
  metaPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
  },
  icebreakerBox: {
    flexDirection: "row",
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  icebreakerBar: {
    width: 3,
    borderRadius: 2,
  },
  icebreakerContent: {
    flex: 1,
    gap: 3,
  },
  icebreakerLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  icebreakerText: {
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    marginTop: 2,
  },
});
