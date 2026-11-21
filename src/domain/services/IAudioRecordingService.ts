/** @format */
/**
 * Domain IAudioRecordingService
 */

import type { VoiceNote } from "@/src/domain/entities/VoiceNote";
import type { DomainError } from "@/src/domain/errors";
import type { Result } from "@/src/domain/Result";

export interface IAudioRecordingService {
  startRecording(): Promise<Result<void, DomainError>>;
  stopRecording(): Promise<Result<VoiceNote, DomainError>>;
  cancelRecording(): Promise<Result<void, DomainError>>;
  isRecording(): boolean;
  getDurationMs(): number;
}
