/** @format */

import { useMemo } from "react";

import { getHapticsService } from "@/src/di/registerHaptics";
import { useOptionalUseCases } from "@/src/di/UseCasesProvider";
import type { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";

export function useHaptics() {
  const useCases = useOptionalUseCases();
  const service = useCases?.getHapticsService ?? getHapticsService();

  return useMemo(
    () => ({
      trigger: (type: HapticFeedbackType) => service.trigger(type).catch(() => {}),
      light: () => service.light().catch(() => {}),
      medium: () => service.medium().catch(() => {}),
      heavy: () => service.heavy().catch(() => {}),
      success: () => service.success().catch(() => {}),
      warning: () => service.warning().catch(() => {}),
      error: () => service.error().catch(() => {}),
      selection: () => service.selection().catch(() => {}),
    }),
    [service]
  );
}
