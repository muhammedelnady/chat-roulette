/** @format */
/**
 * Domain IHaptics Service
 */

export interface IHapticsService {
  light(): Promise<void>;
  medium(): Promise<void>;
  heavy(): Promise<void>;
  success(): Promise<void>;
  warning(): Promise<void>;
  error(): Promise<void>;
  selection(): Promise<void>;
}
