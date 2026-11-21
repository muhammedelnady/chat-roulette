/** @format */
/**
 * Infrastructure Audio Recording Service
 */

import {
  type AudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import AudioModule from "expo-audio/build/AudioModule";

import type { VoiceNote } from "@/src/domain/entities/VoiceNote";
import { AppError, type DomainError } from "@/src/domain/errors";
import { err, ok, type Result } from "@/src/domain/Result";
import type { IAudioRecordingService } from "@/src/domain/services/IAudioRecordingService";

export class ExpoAudioRecordingService implements IAudioRecordingService {
  private recorder: AudioRecorder | null = null;
  private startTime = 0;

  async startRecording(): Promise<Result<void, DomainError>> {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        return err(
          new AppError("Microphone permission was denied", "MICROPHONE_PERMISSION_DENIED")
        );
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const recorderInstance = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recorderInstance.prepareToRecordAsync();
      recorderInstance.record();

      this.recorder = recorderInstance;
      this.startTime = Date.now();

      return ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start recording";
      return err(new AppError(message, "RECORDING_START_FAILED"));
    }
  }

  async stopRecording(): Promise<Result<VoiceNote, DomainError>> {
    try {
      if (!this.recorder) {
        return err(new AppError("No active audio recording to stop", "NO_ACTIVE_RECORDING"));
      }

      await this.recorder.stop();
      const recordingUri = this.recorder.uri;
      const recordedDurationSeconds = this.recorder.currentTime;
      const durationMs =
        recordedDurationSeconds > 0 ? recordedDurationSeconds * 1000 : Date.now() - this.startTime;

      this.recorder = null;

      if (!recordingUri) {
        return err(new AppError("Audio recording produced no audio file", "RECORDING_EMPTY"));
      }

      const voiceNote: VoiceNote = {
        uri: recordingUri,
        durationMs: Math.round(durationMs),
        mimeType: "audio/m4a",
        createdAt: Date.now(),
      };

      return ok(voiceNote);
    } catch (error) {
      this.recorder = null;
      const message = error instanceof Error ? error.message : "Failed to stop recording";
      return err(new AppError(message, "RECORDING_STOP_FAILED"));
    }
  }

  async cancelRecording(): Promise<Result<void, DomainError>> {
    try {
      if (this.recorder) {
        try {
          await this.recorder.stop();
        } catch {}
        this.recorder = null;
      }
      return ok(undefined);
    } catch (error) {
      this.recorder = null;
      const message = error instanceof Error ? error.message : "Failed to cancel recording";
      return err(new AppError(message, "RECORDING_CANCEL_FAILED"));
    }
  }

  isRecording(): boolean {
    return Boolean(this.recorder?.isRecording);
  }

  getDurationMs(): number {
    if (!this.isRecording()) {
      return 0;
    }
    return Math.max(0, Date.now() - this.startTime);
  }
}
