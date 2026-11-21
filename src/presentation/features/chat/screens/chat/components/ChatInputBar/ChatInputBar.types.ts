/** @format */

import type { StagedAttachment } from "../../../../shared/types";

export interface ChatInputBarProps {
  readonly inputText: string;
  readonly onChangeText: (text: string) => void;
  readonly onSend: (content: string) => void;
  readonly onSendAudioNote?: (audioData: {
    readonly uri: string;
    readonly duration: number;
    readonly name?: string;
    readonly type?: string;
  }) => Promise<void>;
  readonly onPickAttachment?: () => void;
  readonly onRemoveStagedAttachment?: (idOrUri: string) => void;
  readonly stagedAttachments?: readonly StagedAttachment[];
  readonly isSending?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly testID?: string;
}
