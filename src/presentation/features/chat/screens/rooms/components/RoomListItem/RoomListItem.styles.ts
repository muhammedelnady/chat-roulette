/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
    marginBottom: 10,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderCurve: "continuous",
    gap: 12,
    overflow: "hidden",
  },
  accentRail: {
    position: "relative",
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  avatarContainer: {
    width: 52,
    height: 52,
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  onlineDot: {
    position: "absolute",
    bottom: -2,
    end: -2,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
  },
  body: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
  },
  timeText: {
    fontVariant: ["tabular-nums"],
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
  },
  metaGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  preview: {
    marginTop: 6,
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  tabular: {
    fontVariant: ["tabular-nums"],
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
