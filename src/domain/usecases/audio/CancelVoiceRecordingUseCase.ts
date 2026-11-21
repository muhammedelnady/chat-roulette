/** @format */

import type { DomainError } from "@/src/domain/errors";
import type { Result } from "@/src/domain/Result";
import type { IAudioRecordingService } from "@/src/domain/services/IAudioRecordingService";

export class CancelVoiceRecordingUseCase {
  constructor(private readonly audioRecordingService: IAudioRecordingService) {}

  async execute(): Promise<Result<void, DomainError>> {
    return this.audioRecordingService.cancelRecording();
  }
}
