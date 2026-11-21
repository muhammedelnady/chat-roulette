/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    minWidth: 215,
    paddingVertical: 4,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  waveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 30,
  },
  waveformBar: {
    flex: 1,
    minWidth: 3,
    borderRadius: 2,
  },
  speedButton: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  speedText: {
    fontSize: 10,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  timeText: {
    fontSize: 10,
  },
});
