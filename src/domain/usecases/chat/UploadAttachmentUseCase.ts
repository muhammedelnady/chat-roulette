/** @format */

import type { MessageAttachmentEntity } from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class UploadAttachmentUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(formData: FormData): Promise<Result<MessageAttachmentEntity, AppError>> {
    try {
      const result = await this.messageRepository.uploadAttachment(formData);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to upload attachment", "ATTACHMENT_UPLOAD_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
