/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stagingTray: {
    paddingBottom: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  stagedList: {
    gap: 10,
  },
  stagedItem: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
  },
  stagedThumbnail: {
    width: "100%",
    height: "100%",
  },
  stagedOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 42,
    maxHeight: 110,
    justifyContent: "center",
  },
  input: {
    fontSize: 14,
    padding: 0,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingTray: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
  },
  recordingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  recordingLabel: {
    flex: 1,
  },
  recordingTimer: {
    fontVariant: ["tabular-nums"],
  },
});
