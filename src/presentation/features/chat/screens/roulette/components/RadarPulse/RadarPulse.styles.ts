/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 20,
  },
  outerRing: {
    position: "absolute",
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 1.5,
  },
  middleRing: {
    position: "absolute",
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 1.5,
  },
  centerOrb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
