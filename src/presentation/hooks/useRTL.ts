/** @format */

import { useDirectionStore } from "@stores/useDirectionStore";

export function useRTL() {
  const direction = useDirectionStore((s) => s.direction);
  const isRTL = direction === "rtl";

  return {
    isRTL,
    direction,
    textAlign: isRTL ? "right" : "left",
  } as const;
}
