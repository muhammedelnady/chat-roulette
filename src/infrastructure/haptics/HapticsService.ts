/** @format */
/**
 * Infrastructure Haptics Service
 */

import * as Haptics from "expo-haptics";

import type { IHapticsService } from "@/src/domain/services";
import { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";

export class HapticsService implements IHapticsService {
  async trigger(type: HapticFeedbackType): Promise<void> {
    switch (type) {
      case HapticFeedbackType.Light:
        await this.light();
        break;
      case HapticFeedbackType.Medium:
        await this.medium();
        break;
      case HapticFeedbackType.Heavy:
        await this.heavy();
        break;
      case HapticFeedbackType.Success:
        await this.success();
        break;
      case HapticFeedbackType.Warning:
        await this.warning();
        break;
      case HapticFeedbackType.Error:
        await this.error();
        break;
      case HapticFeedbackType.Selection:
        await this.selection();
        break;
    }
  }

  async light(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }

  async medium(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  }

  async heavy(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
  }

  async success(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }

  async warning(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  }

  async error(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  }

  async selection(): Promise<void> {
    try {
      await Haptics.selectionAsync();
    } catch {}
  }
}
