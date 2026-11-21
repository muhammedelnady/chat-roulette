/** @format */

import { log } from "@/src/infrastructure/logging/logger";

export interface BoundaryErrorContext {
  readonly boundary: string;
  readonly section?: string;
}

export function reportBoundaryError(
  error: Error,
  componentStack?: string | null,
  context?: BoundaryErrorContext
): void {
  log.error(
    `[ErrorBoundary:${context?.boundary ?? "unknown"}] ${context?.section ?? ""}`,
    error.message,
    componentStack
  );
}
