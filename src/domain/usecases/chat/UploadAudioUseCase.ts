/** @format */

import { AppError } from "@/src/domain/errors";
import type { IMessageRepository, UploadAudioResult } from "@/src/domain/repositories";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export class UploadAudioUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(formData: FormData): Promise<Result<UploadAudioResult, AppError>> {
    try {
      const result = await this.messageRepository.uploadAudio(formData);
      if (isErr(result)) return err(result.error);
      return ok(result.value);
    } catch (error) {
      return err(
        new AppError("Failed to upload audio", "AUDIO_UPLOAD_FAILED", {
          originalError: error,
        })
      );
    }
  }
}
