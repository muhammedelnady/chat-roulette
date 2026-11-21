/** @format */

import type { VoiceNote } from "@/src/domain/entities/VoiceNote";
import type { DomainError } from "@/src/domain/errors";
import type { Result } from "@/src/domain/Result";
import type { IAudioRecordingService } from "@/src/domain/services/IAudioRecordingService";

export class StopVoiceRecordingUseCase {
  constructor(private readonly audioRecordingService: IAudioRecordingService) {}

  async execute(): Promise<Result<VoiceNote, DomainError>> {
    return this.audioRecordingService.stopRecording();
  }
}
