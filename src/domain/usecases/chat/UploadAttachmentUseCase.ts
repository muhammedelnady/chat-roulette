/** @format */

import type { MessageAttachmentEntity } from "@/src/domain/entities";
import type { AppError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import type { Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class UploadAttachmentUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(formData: FormData): Promise<Result<MessageAttachmentEntity, AppError>> {
    return safeExecute(
      () => this.messageRepository.uploadAttachment(formData),
      "Failed to upload attachment",
      "ATTACHMENT_UPLOAD_FAILED"
    );
  }
}
