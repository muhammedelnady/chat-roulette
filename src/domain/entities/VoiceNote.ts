/** @format */
/**
 * Domain VoiceNote Entity
 */

export interface VoiceNote {
  readonly uri: string;
  readonly durationMs: number;
  readonly size?: number;
  readonly mimeType: string;
  readonly createdAt: number;
}
