/** @format */

import type { DomainError } from "@/src/domain/errors";
import type { Result } from "@/src/domain/Result";
import type { IAudioRecordingService } from "@/src/domain/services/IAudioRecordingService";
import { safeExecuteDomain } from "@/src/domain/usecases/safeExecute";

export class CancelVoiceRecordingUseCase {
  constructor(private readonly audioRecordingService: IAudioRecordingService) {}

  async execute(): Promise<Result<void, DomainError>> {
    return safeExecuteDomain(
      () => this.audioRecordingService.cancelRecording(),
      "Failed to cancel voice recording",
      "RECORDING_CANCEL_FAILED"
    );
  }
}
