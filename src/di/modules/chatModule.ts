/** @format */

import { configureHttpAuth } from "@/src/data/api";
import { ChatRepositoryImpl } from "@/src/data/repositories/ChatRepositoryImpl";
import { MessageRepositoryImpl } from "@/src/data/repositories/MessageRepositoryImpl";
import {
  SimulatedChatRepository,
  SimulatedChatSocketService,
  SimulatedMessageRepository,
} from "@/src/data/simulated/SimulatedChatRepositories";
import { ChatSocketService } from "@/src/data/socket/ChatSocketService";
import type { IConversationRepository, IMessageRepository } from "@/src/domain/repositories";
import type { IChatSocketService } from "@/src/domain/services";
import {
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
import { log } from "@/src/infrastructure/logging/logger";
import { TokenStorageImpl } from "@/src/infrastructure/storage/TokenStorageImpl";
import { env, isSimulatedChatMode } from "@/src/infrastructure/system/env";

import { connectivityModule } from "./connectivityModule";

const tokenStorage = new TokenStorageImpl();
configureHttpAuth(tokenStorage);

const conversationRepository: IConversationRepository = isSimulatedChatMode
  ? new SimulatedChatRepository()
  : new ChatRepositoryImpl(connectivityModule.getConnectivityChecker());

const messageRepository: IMessageRepository = isSimulatedChatMode
  ? new SimulatedMessageRepository()
  : new MessageRepositoryImpl(connectivityModule.getConnectivityChecker());

let _chatSocketService: IChatSocketService | null = null;

const getChatSocketService = (): IChatSocketService =>
  (_chatSocketService ??= isSimulatedChatMode
    ? new SimulatedChatSocketService(log, connectivityModule.getConnectivityChecker())
    : new ChatSocketService(
        env.EXPO_PUBLIC_API_URL,
        log,
        connectivityModule.getConnectivityChecker(),
        tokenStorage
      ));

const getConversationsUseCase = new GetConversationsUseCase(conversationRepository);
const getConversationByIdUseCase = new GetConversationByIdUseCase(conversationRepository);
const createConversationUseCase = new CreateConversationUseCase(conversationRepository);
const matchRouletteUseCase = new MatchRouletteUseCase(conversationRepository);
const closeConversationUseCase = new CloseConversationUseCase(conversationRepository);
const getMessagesUseCase = new GetMessagesUseCase(messageRepository);
const sendMessageUseCase = new SendMessageUseCase(messageRepository);
const markMessageReadUseCase = new MarkMessageReadUseCase(messageRepository);
const toggleMessageReactionUseCase = new ToggleMessageReactionUseCase(messageRepository);
const uploadAttachmentUseCase = new UploadAttachmentUseCase(messageRepository);
const deleteAttachmentUseCase = new DeleteAttachmentUseCase(messageRepository);
const uploadAudioUseCase = new UploadAudioUseCase(messageRepository);

export const chatModule = {
  getConversationRepository: () => conversationRepository,
  getMessageRepository: () => messageRepository,
  getChatSocketService: () => getChatSocketService(),
  getGetConversationsUseCase: () => getConversationsUseCase,
  getGetConversationByIdUseCase: () => getConversationByIdUseCase,
  getCreateConversationUseCase: () => createConversationUseCase,
  getMatchRouletteUseCase: () => matchRouletteUseCase,
  getCloseConversationUseCase: () => closeConversationUseCase,
  getGetMessagesUseCase: () => getMessagesUseCase,
  getSendMessageUseCase: () => sendMessageUseCase,
  getMarkMessageReadUseCase: () => markMessageReadUseCase,
  getToggleMessageReactionUseCase: () => toggleMessageReactionUseCase,
  getUploadAttachmentUseCase: () => uploadAttachmentUseCase,
  getDeleteAttachmentUseCase: () => deleteAttachmentUseCase,
  getUploadAudioUseCase: () => uploadAudioUseCase,
};
