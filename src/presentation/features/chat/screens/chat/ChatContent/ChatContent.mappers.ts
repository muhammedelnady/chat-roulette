/** @format */

import type { ChatAttachmentEntity } from "../../../shared/types";

export function mapAttachmentEntity(att: ChatAttachmentEntity) {
  return {
    uploadId: att.uploadId,
    url: att.url,
    mimeType: att.mimeType,
    fileName: att.fileName,
    fileSize: att.fileSize,
    width: att.width ?? undefined,
    height: att.height ?? undefined,
    cloudinaryId: att.cloudinaryId ?? undefined,
  };
}
