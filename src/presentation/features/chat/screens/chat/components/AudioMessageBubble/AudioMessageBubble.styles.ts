/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    minWidth: 222,
    paddingVertical: 4,
    direction: "ltr",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  waveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 32,
  },
  waveformBarButton: {
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  waveformBar: {
    width: "100%",
    minWidth: 3,
    borderRadius: 999,
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  speedText: {
    fontSize: 10,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingHorizontal: 2,
  },
  timeText: {
    fontSize: 10,
    opacity: 0.85,
    fontVariant: ["tabular-nums"],
  },
});
