/** @format */

import type { ReactNode } from "react";

import { BaseErrorBoundary, type BaseErrorBoundaryProps } from "./BaseErrorBoundary";
import { ListErrorFallback } from "./ListErrorFallback";

interface ListErrorBoundaryProps extends BaseErrorBoundaryProps {
  readonly sectionName?: string;
}

export class ListErrorBoundary extends BaseErrorBoundary<ListErrorBoundaryProps> {
  protected override readonly boundaryName = "list";

  protected override getCaptureContext() {
    return { boundary: this.boundaryName, section: this.props.sectionName };
  }

  protected override getFallback(error: Error | null): ReactNode {
    return (
      <ListErrorFallback error={error} sectionName={this.props.sectionName} onRetry={this.reset} />
    );
  }
}
