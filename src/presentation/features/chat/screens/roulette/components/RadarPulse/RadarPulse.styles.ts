/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 14,
  },
  crosshairH: {
    position: "absolute",
    width: 224,
    height: 1,
  },
  crosshairV: {
    position: "absolute",
    width: 1,
    height: 224,
  },
  telemetryRing: {
    position: "absolute",
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardinalDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotNorth: {
    top: -3,
  },
  dotSouth: {
    bottom: -3,
  },
  dotEast: {
    right: -3,
  },
  dotWest: {
    left: -3,
  },
  waveRing: {
    position: "absolute",
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 1.5,
  },
  waveRingMid: {
    position: "absolute",
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 1.5,
  },
  sweepTrack: {
    position: "absolute",
    width: 168,
    height: 168,
    alignItems: "center",
    justifyContent: "center",
  },
  sweepRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1,
    alignItems: "center",
  },
  sweepBeacon: {
    position: "absolute",
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  orbOuterHalo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  centerOrb: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
  },
});
