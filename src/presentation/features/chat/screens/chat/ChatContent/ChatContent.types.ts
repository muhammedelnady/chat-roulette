/** @format */

import type { QueueStatusPayload, SupportPresencePayload } from "@/src/domain/services";

import type {
  ChatConversationEntity,
  ChatMessageEntity,
  StagedAttachment,
} from "../../../shared/types";

export interface SendMessageOptions {
  readonly includeStagedAttachments?: boolean;
}

export interface ChatViewModel {
  readonly conversation: ChatConversationEntity | null;
  readonly messages: readonly ChatMessageEntity[];
  readonly inputText: string;
  readonly stagedAttachments: readonly StagedAttachment[];
  readonly typingUsers: readonly string[];
  readonly isLoading: boolean;
  readonly isSending: boolean;
  readonly isError: boolean;
  readonly error: string | null;
  readonly isClosed: boolean;
  readonly supportPresence: SupportPresencePayload | null;
  readonly queueStatus: QueueStatusPayload | null;
  readonly headerSubtitle: string;
  readonly isNetworkOnline: boolean;
  readonly outboundQueueCount: number;
  readonly setInputText: (text: string) => void;
  readonly sendMessage: (content: string, options?: SendMessageOptions) => Promise<void> | void;
  readonly handleRetryMessage: (message: ChatMessageEntity) => Promise<void> | void;
  readonly sendAudioNote: (audioData: {
    readonly uri: string;
    readonly duration: number;
    readonly name?: string;
    readonly type?: string;
  }) => Promise<void>;
  readonly pickAttachment: () => Promise<void>;
  readonly removeStagedAttachment: (idOrUri: string) => void;
  readonly deleteAttachment: (attachmentId: string, messageId?: string) => Promise<void>;
  readonly toggleReaction: (messageId: string, emoji: string) => Promise<void> | void;
  readonly toggleOfflineMode: () => void;
  readonly spinNextMatch: () => void;
  readonly loadMore: () => void;
  readonly refresh: () => Promise<void>;
  readonly navigateBack: () => void;
}

export interface ChatContentProps {
  readonly conversationId?: string;
  readonly testID?: string;
  readonly viewModel?: ChatViewModel;
}
