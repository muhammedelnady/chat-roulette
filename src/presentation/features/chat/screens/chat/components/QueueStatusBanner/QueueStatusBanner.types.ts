/** @format */

import type { QueueStatusPayload } from "@/src/domain/services";

export interface QueueStatusBannerProps {
  readonly queueStatus: QueueStatusPayload | null;
  readonly isOffline?: boolean;
  readonly pendingCount?: number;
  readonly testID?: string;
}
