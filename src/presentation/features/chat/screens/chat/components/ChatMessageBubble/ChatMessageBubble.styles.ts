/** @format */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 14,
  },
  bubbleColumn: {
    maxWidth: "82%",
  },
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    marginHorizontal: 2,
  },
  senderAvatarBadge: {
    width: 18,
    height: 18,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  senderInitialText: {
    fontSize: 10,
  },
  senderLabel: {
    letterSpacing: 0.1,
  },
  bubbleShell: {
    borderCurve: "continuous",
  },
  bubbleClip: {
    borderCurve: "continuous",
    overflow: "hidden",
  },
  ownBubbleShell: {
    borderWidth: 0,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deletedBubble: {
    borderRadius: 16,
    borderWidth: 1,
  },
  botBadgeRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
    marginBottom: 6,
  },
  messageTextAuto: {
    lineHeight: 20,
  },
  deletedMessageText: {
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 5,
    gap: 4,
  },
  editedLabelText: {
    fontSize: 10,
    opacity: 0.85,
    fontVariant: ["tabular-nums"],
  },
  tickIcon: {
    marginStart: 2,
  },
  retryRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
    marginTop: 6,
  },
  reactionsWrapper: {
    gap: 6,
    marginTop: 6,
  },
  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
  },
  reactionCountText: {
    fontVariant: ["tabular-nums"],
  },
  quickReactCapsule: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
  },
  quickReactBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentsContainer: {
    marginBottom: 6,
    gap: 6,
  },
  imageWrapper: {
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
  },
  attachmentImage: {
    width: 214,
    height: 152,
    borderRadius: 13,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 9,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: 9,
  },
  fileIconMedallion: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileSizeText: {
    fontSize: 10,
    opacity: 0.8,
    fontVariant: ["tabular-nums"],
  },
  deletedAttachmentBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    gap: 6,
  },
  deletedAttachmentText: {
    fontStyle: "italic",
  },
  botOptionsContainer: {
    marginTop: 8,
    gap: 6,
  },
  botOptionPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: 8,
  },
  botOptionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lightboxRoot: {
    flex: 1,
  },
  lightboxContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  lightboxCloseBtn: {
    position: "absolute",
    top: 48,
    end: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxScroll: {
    width: "100%",
  },
  lightboxScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
