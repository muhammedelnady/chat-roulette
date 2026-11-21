/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
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
    width: 62,
    height: 62,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
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
  dismissBadgeContainer: {
    position: "absolute",
    top: 4,
    end: 4,
    zIndex: 2,
  },
  dismissBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  attachButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.25,
    paddingHorizontal: 15,
    paddingVertical: 9,
    minHeight: 42,
    maxHeight: 112,
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
    overflow: "hidden",
  },
  gradientActionFill: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
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
  recordingLabel: {
    flex: 1,
  },
  recordingMeter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 18,
  },
  recordingMeterBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  recordingTimer: {
    fontVariant: ["tabular-nums"],
  },
});
