/** @format */

import {
  CancelVoiceRecordingUseCase,
  StartVoiceRecordingUseCase,
  StopVoiceRecordingUseCase,
} from "@/src/domain/usecases/audio";
import { ExpoAudioRecordingService } from "@/src/infrastructure/audio/ExpoAudioRecordingService";

let _audioRecordingService: ExpoAudioRecordingService | null = null;
let _startVoiceRecordingUseCase: StartVoiceRecordingUseCase | null = null;
let _stopVoiceRecordingUseCase: StopVoiceRecordingUseCase | null = null;
let _cancelVoiceRecordingUseCase: CancelVoiceRecordingUseCase | null = null;

const getAudioRecordingService = (): ExpoAudioRecordingService =>
  (_audioRecordingService ??= new ExpoAudioRecordingService());

const getStartVoiceRecordingUseCase = (): StartVoiceRecordingUseCase =>
  (_startVoiceRecordingUseCase ??= new StartVoiceRecordingUseCase(getAudioRecordingService()));

const getStopVoiceRecordingUseCase = (): StopVoiceRecordingUseCase =>
  (_stopVoiceRecordingUseCase ??= new StopVoiceRecordingUseCase(getAudioRecordingService()));

const getCancelVoiceRecordingUseCase = (): CancelVoiceRecordingUseCase =>
  (_cancelVoiceRecordingUseCase ??= new CancelVoiceRecordingUseCase(getAudioRecordingService()));

export const audioModule = {
  getAudioRecordingService,
  getStartVoiceRecordingUseCase,
  getStopVoiceRecordingUseCase,
  getCancelVoiceRecordingUseCase,
};
