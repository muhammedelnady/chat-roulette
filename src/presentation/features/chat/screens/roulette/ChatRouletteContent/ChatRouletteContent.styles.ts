/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    letterSpacing: -0.3,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  topicsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  topicChipDisabled: {
    opacity: 0.5,
  },
  telemetryPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
    marginBottom: 4,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
    gap: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    flexShrink: 1,
  },
  footerCta: {
    marginTop: "auto",
  },
});
