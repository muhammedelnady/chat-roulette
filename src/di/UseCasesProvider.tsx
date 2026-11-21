/** @format */

import { createContext, type ReactNode, useContext, useMemo } from "react";

import { container } from "@/src/di/container";
import type { IChatSocketService } from "@/src/domain/services";
import type {
  CancelVoiceRecordingUseCase,
  StartVoiceRecordingUseCase,
  StopVoiceRecordingUseCase,
} from "@/src/domain/usecases/audio";
import type {
  CloseConversationUseCase,
  CreateConversationUseCase,
  DeleteAttachmentUseCase,
  GetConversationByIdUseCase,
  GetConversationsUseCase,
  GetMessagesUseCase,
  MarkMessageReadUseCase,
  MatchRouletteUseCase,
  SendMessageUseCase,
  ToggleMessageReactionUseCase,
  UploadAttachmentUseCase,
  UploadAudioUseCase,
} from "@/src/domain/usecases/chat";

export interface UseCasesContextValue {
  readonly getChatSocketService: IChatSocketService;
  readonly getGetConversationsUseCase: GetConversationsUseCase;
  readonly getGetConversationByIdUseCase: GetConversationByIdUseCase;
  readonly getCreateConversationUseCase: CreateConversationUseCase;
  readonly getMatchRouletteUseCase: MatchRouletteUseCase;
  readonly getCloseConversationUseCase: CloseConversationUseCase;
  readonly getGetMessagesUseCase: GetMessagesUseCase;
  readonly getSendMessageUseCase: SendMessageUseCase;
  readonly getMarkMessageReadUseCase: MarkMessageReadUseCase;
  readonly getToggleMessageReactionUseCase: ToggleMessageReactionUseCase;
  readonly getUploadAttachmentUseCase: UploadAttachmentUseCase;
  readonly getDeleteAttachmentUseCase: DeleteAttachmentUseCase;
  readonly getUploadAudioUseCase: UploadAudioUseCase;
  readonly startVoiceRecordingUseCase: StartVoiceRecordingUseCase;
  readonly stopVoiceRecordingUseCase: StopVoiceRecordingUseCase;
  readonly cancelVoiceRecordingUseCase: CancelVoiceRecordingUseCase;
}

const UseCasesContext = createContext<UseCasesContextValue | null>(null);

export interface UseCasesProviderProps {
  readonly children: ReactNode;
}

export function UseCasesProvider({ children }: UseCasesProviderProps) {
  const value = useMemo<UseCasesContextValue>(
    () => ({
      getChatSocketService: container.getChatSocketService(),
      getGetConversationsUseCase: container.getGetConversationsUseCase(),
      getGetConversationByIdUseCase: container.getGetConversationByIdUseCase(),
      getCreateConversationUseCase: container.getCreateConversationUseCase(),
      getMatchRouletteUseCase: container.getMatchRouletteUseCase(),
      getCloseConversationUseCase: container.getCloseConversationUseCase(),
      getGetMessagesUseCase: container.getGetMessagesUseCase(),
      getSendMessageUseCase: container.getSendMessageUseCase(),
      getMarkMessageReadUseCase: container.getMarkMessageReadUseCase(),
      getToggleMessageReactionUseCase: container.getToggleMessageReactionUseCase(),
      getUploadAttachmentUseCase: container.getUploadAttachmentUseCase(),
      getDeleteAttachmentUseCase: container.getDeleteAttachmentUseCase(),
      getUploadAudioUseCase: container.getUploadAudioUseCase(),
      startVoiceRecordingUseCase: container.getStartVoiceRecordingUseCase(),
      stopVoiceRecordingUseCase: container.getStopVoiceRecordingUseCase(),
      cancelVoiceRecordingUseCase: container.getCancelVoiceRecordingUseCase(),
    }),
    []
  );

  return <UseCasesContext.Provider value={value}>{children}</UseCasesContext.Provider>;
}

export function useUseCases(): UseCasesContextValue {
  const ctx = useContext(UseCasesContext);
  if (!ctx) {
    throw new Error("useUseCases must be used within UseCasesProvider");
  }
  return ctx;
}
