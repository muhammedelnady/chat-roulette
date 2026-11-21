/** @format */

import type { AppError } from "@/src/domain/errors";
import type { IMessageRepository, UploadAudioResult } from "@/src/domain/repositories";
import type { Result } from "@/src/domain/Result";
import { safeExecute } from "@/src/domain/usecases/safeExecute";

export class UploadAudioUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(formData: FormData): Promise<Result<UploadAudioResult, AppError>> {
    return safeExecute(
      () => this.messageRepository.uploadAudio(formData),
      "Failed to upload audio",
      "AUDIO_UPLOAD_FAILED"
    );
  }
}
