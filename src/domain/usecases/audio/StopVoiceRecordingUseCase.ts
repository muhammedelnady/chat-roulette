/** @format */

import type { VoiceNote } from "@/src/domain/entities/VoiceNote";
import type { DomainError } from "@/src/domain/errors";
import type { Result } from "@/src/domain/Result";
import type { IAudioRecordingService } from "@/src/domain/services/IAudioRecordingService";
import { safeExecuteDomain } from "@/src/domain/usecases/safeExecute";

export class StopVoiceRecordingUseCase {
  constructor(private readonly audioRecordingService: IAudioRecordingService) {}

  async execute(): Promise<Result<VoiceNote, DomainError>> {
    return safeExecuteDomain(
      () => this.audioRecordingService.stopRecording(),
      "Failed to stop voice recording",
      "RECORDING_STOP_FAILED"
    );
  }
}
