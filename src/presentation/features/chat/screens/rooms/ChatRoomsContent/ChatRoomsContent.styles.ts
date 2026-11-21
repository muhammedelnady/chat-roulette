/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  brandCluster: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  brandEmblem: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextGroup: {
    flex: 1,
  },
  brandTitle: {
    letterSpacing: -0.4,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1.25,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoriesScroll: {
    marginBottom: 12,
  },
  categoriesContent: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  sectionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  countPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabular: {
    fontVariant: ["tabular-nums"],
  },
  listContent: {
    paddingBottom: 28,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    marginTop: 8,
  },
  emptyHalo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginBottom: 6,
  },
  retryWrapper: {
    marginTop: 14,
    width: 160,
  },
});
