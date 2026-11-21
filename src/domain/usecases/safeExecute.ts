/** @format */

import { AppError, DomainError } from "@/src/domain/errors";
import { err, isErr, ok, type Result } from "@/src/domain/Result";

export async function safeExecute<T>(
  operation: () => Promise<Result<T, DomainError>>,
  fallbackMessage: string,
  fallbackCode: string
): Promise<Result<T, AppError>> {
  try {
    const result = await operation();
    if (isErr(result)) {
      return err(
        result.error instanceof AppError
          ? result.error
          : new AppError(result.error.message, result.error.code, result.error.details)
      );
    }
    return ok(result.value);
  } catch (error) {
    if (error instanceof AppError) {
      return err(error);
    }
    if (error instanceof DomainError) {
      return err(new AppError(error.message, error.code, error.details, error.category));
    }
    return err(new AppError(fallbackMessage, fallbackCode, { originalError: error }));
  }
}

export async function safeExecuteDomain<T>(
  operation: () => Promise<Result<T, DomainError>>,
  fallbackMessage: string,
  fallbackCode: string
): Promise<Result<T, DomainError>> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof DomainError) {
      return err(error);
    }
    return err(new AppError(fallbackMessage, fallbackCode, { originalError: error }));
  }
}
