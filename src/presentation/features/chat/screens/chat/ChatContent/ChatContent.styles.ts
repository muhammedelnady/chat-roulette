/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
  },
  emptyListContent: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  closedNotice: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
