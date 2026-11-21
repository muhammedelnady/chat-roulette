/** @format */
/**
 * Infrastructure Haptics Service
 */

import * as Haptics from "expo-haptics";

import type { IHapticsService } from "@/src/domain/services";

export class HapticsService implements IHapticsService {
  async light(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async medium(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async heavy(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  async success(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async warning(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  async error(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  async selection(): Promise<void> {
    await Haptics.selectionAsync();
  }
}
