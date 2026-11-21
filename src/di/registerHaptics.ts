/** @format */

import type { IHapticsService } from "@/src/domain/services";
import { HapticsService } from "@/src/infrastructure/haptics/HapticsService";

let hapticsInstance: IHapticsService | null = null;

export function getHapticsService(): IHapticsService {
  hapticsInstance ??= new HapticsService();
  return hapticsInstance;
}

export function setHapticsService(service: IHapticsService): void {
  hapticsInstance = service;
}
