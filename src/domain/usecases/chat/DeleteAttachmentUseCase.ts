/** @format */

import { AppError } from "@/src/domain/errors";
import type { IMessageRepository } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class DeleteAttachmentUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(attachmentId: string): Promise<Result<void, AppError>> {
    try {
      const result = await this.messageRepository.deleteAttachment(attachmentId);
      if (isErr(result)) return err(result.error);
      return ok(undefined);
    } catch (error) {
      return err(
        new AppError("Failed to delete attachment", "ATTACHMENT_DELETE_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
