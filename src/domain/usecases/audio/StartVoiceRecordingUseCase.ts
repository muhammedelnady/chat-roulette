/** @format */

import { AppError, type DomainError } from "@/src/domain/errors";
import { err, type Result } from "@/src/domain/Result";
import type { IAudioRecordingService } from "@/src/domain/services/IAudioRecordingService";
import { safeExecuteDomain } from "@/src/domain/usecases/safeExecute";

export class StartVoiceRecordingUseCase {
  constructor(private readonly audioRecordingService: IAudioRecordingService) {}

  async execute(): Promise<Result<void, DomainError>> {
    if (this.audioRecordingService.isRecording()) {
      return err(new AppError("Recording already in progress", "RECORDING_ALREADY_ACTIVE"));
    }
    return safeExecuteDomain(
      () => this.audioRecordingService.startRecording(),
      "Failed to start voice recording",
      "RECORDING_START_FAILED"
    );
  }
}
