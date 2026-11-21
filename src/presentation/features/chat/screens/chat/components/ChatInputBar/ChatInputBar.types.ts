/** @format */

import type { StagedAttachment } from "../../../../shared/types";

export interface ChatInputBarProps {
  readonly inputText: string;
  readonly onChangeText: (text: string) => void;
  readonly onSend: (content: string) => void;
  readonly onSendAudioNote?: (audioData: {
    uri: string;
    duration: number;
    name?: string;
    type?: string;
  }) => Promise<void>;
  readonly onPickAttachment?: () => void;
  readonly onRemoveStagedAttachment?: (uri: string) => void;
  readonly stagedAttachments?: readonly StagedAttachment[];
  readonly isSending?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly testID?: string;
}
