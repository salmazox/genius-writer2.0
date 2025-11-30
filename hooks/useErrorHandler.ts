/**
 * React hook for error handling with toast integration
 */

import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import {
  handleError as baseHandleError,
  getErrorMessage,
  ErrorContext,
  AppError,
  isAbortError,
} from '../utils/errorHandler';

interface UseErrorHandlerOptions {
  defaultContext?: ErrorContext;
  showToastByDefault?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { showToast } = useToast();
  const { defaultContext, showToastByDefault = true } = options;

  /**
   * Handle an error with optional toast notification
   */
  const handleError = useCallback(
    (error: unknown, context?: ErrorContext, showToastOverride?: boolean): AppError => {
      // Don't show toast for abort errors (user-initiated cancellations)
      if (isAbortError(error)) {
        return baseHandleError(error, { ...defaultContext, ...context });
      }

      const appError = baseHandleError(error, { ...defaultContext, ...context });

      // Show toast if enabled
      const shouldShowToast = showToastOverride ?? showToastByDefault;
      if (shouldShowToast) {
        showToast(appError.userMessage, 'error');
      }

      return appError;
    },
    [showToast, defaultContext, showToastByDefault]
  );

  /**
   * Wrap an async function with error handling
   */
  const withErrorHandling = useCallback(
    <T extends (...args: unknown[]) => Promise<R>, R>(
      fn: T,
      context?: ErrorContext
    ): ((...args: Parameters<T>) => Promise<R | undefined>) => {
      return async (...args: Parameters<T>): Promise<R | undefined> => {
        try {
          return await fn(...args);
        } catch (error) {
          handleError(error, context);
          return undefined;
        }
      };
    },
    [handleError]
  );

  /**
   * Try-catch wrapper that returns [error, result] tuple
   */
  const tryCatch = useCallback(
    async <T>(
      fn: () => Promise<T>,
      context?: ErrorContext
    ): Promise<[AppError | null, T | undefined]> => {
      try {
        const result = await fn();
        return [null, result];
      } catch (error) {
        const appError = handleError(error, context);
        return [appError, undefined];
      }
    },
    [handleError]
  );

  return {
    handleError,
    withErrorHandling,
    tryCatch,
    getErrorMessage,
  };
};
