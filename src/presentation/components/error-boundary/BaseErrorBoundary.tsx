/** @format */

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { reportBoundaryError, type BoundaryErrorContext } from "./reportError";

export interface BaseErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
  readonly resetKeys?: readonly unknown[];
  readonly onRetry?: () => void;
}

export interface BaseErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export abstract class BaseErrorBoundary<
  P extends BaseErrorBoundaryProps = BaseErrorBoundaryProps,
> extends Component<P, BaseErrorBoundaryState> {
  override state: BaseErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): BaseErrorBoundaryState {
    return { hasError: true, error };
  }

  protected abstract readonly boundaryName: string;

  protected getCaptureContext(): BoundaryErrorContext {
    return { boundary: this.boundaryName };
  }

  protected abstract getFallback(error: Error | null): ReactNode;

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportBoundaryError(error, errorInfo.componentStack, this.getCaptureContext());
    this.props.onError?.(error, errorInfo);
  }

  override componentDidUpdate(prevProps: Readonly<P>) {
    const { resetKeys } = this.props;

    if (
      this.state.hasError &&
      resetKeys &&
      (resetKeys.length !== prevProps.resetKeys?.length ||
        resetKeys.some((key, i) => !Object.is(key, prevProps.resetKeys?.[i])))
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  override render() {
    if (!this.state.hasError) return this.props.children;
    return this.getFallback(this.state.error);
  }
}
