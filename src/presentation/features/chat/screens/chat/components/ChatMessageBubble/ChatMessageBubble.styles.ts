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
  senderLabel: {
    marginBottom: 3,
    marginHorizontal: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
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
    marginTop: 4,
    gap: 4,
  },
  editedLabelText: {
    fontSize: 10,
    opacity: 0.8,
  },
  tickIcon: {
    marginLeft: 2,
  },
  retryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
  },
  quickReactRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  quickReactBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  attachmentsContainer: {
    marginBottom: 6,
    gap: 6,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  attachmentImage: {
    width: 210,
    height: 150,
    borderRadius: 12,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileSizeText: {
    fontSize: 10,
    opacity: 0.8,
  },
  deletedAttachmentBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  lightboxContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxCloseBtn: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  lightboxScroll: {
    width: "100%",
  },
  lightboxScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxImage: {
    width: 320,
    height: 440,
  },
});
