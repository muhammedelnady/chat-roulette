/** @format */
/**
 * Domain IHaptics Service
 */

import type { HapticFeedbackType } from "./HapticFeedbackType";

export interface IHapticsService {
  trigger(type: HapticFeedbackType): Promise<void>;
  light(): Promise<void>;
  medium(): Promise<void>;
  heavy(): Promise<void>;
  success(): Promise<void>;
  warning(): Promise<void>;
  error(): Promise<void>;
  selection(): Promise<void>;
}
