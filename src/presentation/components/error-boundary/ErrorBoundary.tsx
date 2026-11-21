/** @format */

import type { ReactNode } from "react";

import { BaseErrorBoundary, type BaseErrorBoundaryProps } from "./BaseErrorBoundary";
import { ErrorFallback } from "./ErrorFallback";

interface ErrorBoundaryProps extends BaseErrorBoundaryProps {
  readonly fallback?: ReactNode;
}

export class ErrorBoundary extends BaseErrorBoundary<ErrorBoundaryProps> {
  protected override readonly boundaryName = "root";

  protected override getFallback(error: Error | null): ReactNode {
    return <ErrorFallback error={error} resetErrorBoundary={this.reset} />;
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? this.getFallback(this.state.error);
    }
    return this.props.children;
  }
}
