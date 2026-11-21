/** @format */

import { type AppError, ValidationError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, type Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class DeleteAttachmentUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(attachmentId: string): Promise<Result<void, AppError>> {
    if (!attachmentId.trim()) {
      return err(new ValidationError("Attachment ID is required", "attachmentId"));
    }
    return safeExecute(
      () => this.messageRepository.deleteAttachment(attachmentId),
      "Failed to delete attachment",
      "ATTACHMENT_DELETE_FAILED"
    );
  }
}
