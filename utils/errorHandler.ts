/**
 * Centralized Error Handling System
 * Provides structured error types, logging, and user-friendly error messages
 */

// ============================================================================
// Error Types
// ============================================================================

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  OFFLINE = 'OFFLINE',
  TIMEOUT = 'TIMEOUT',

  // API errors
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Storage errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // Generation errors
  GENERATION_ERROR = 'GENERATION_ERROR',
  USAGE_LIMIT_EXCEEDED = 'USAGE_LIMIT_EXCEEDED',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  code: ErrorCode;
  context?: ErrorContext;
  originalError?: unknown;
  timestamp: Date;
  userMessage: string;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    context?: ErrorContext,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: ErrorContext, originalError?: unknown) {
    super(
      ErrorCode.NETWORK_ERROR,
      message,
      'Network error occurred. Please check your connection and try again.',
      context,
      originalError
    );
    this.name = 'NetworkError';
  }
}

export class ApiError extends AppError {
  statusCode?: number;

  constructor(
    message: string,
    statusCode?: number,
    context?: ErrorContext,
    originalError?: unknown
  ) {
    const userMessage = statusCode === 429
      ? 'Too many requests. Please wait a moment and try again.'
      : statusCode === 401 || statusCode === 403
      ? 'You do not have permission to perform this action.'
      : 'An error occurred while processing your request. Please try again.';

    super(ErrorCode.API_ERROR, message, userMessage, context, originalError);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  fields?: string[];

  constructor(
    message: string,
    fields?: string[],
    context?: ErrorContext,
    originalError?: unknown
  ) {
    super(
      ErrorCode.VALIDATION_ERROR,
      message,
      'Please check your input and try again.',
      context,
      originalError
    );
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class StorageError extends AppError {
  constructor(message: string, context?: ErrorContext, originalError?: unknown) {
    super(
      ErrorCode.STORAGE_ERROR,
      message,
      'Failed to save data. Please try again or clear some space.',
      context,
      originalError
    );
    this.name = 'StorageError';
  }
}

export class UsageLimitError extends AppError {
  limit?: number;
  current?: number;

  constructor(
    message: string,
    limit?: number,
    current?: number,
    context?: ErrorContext
  ) {
    super(
      ErrorCode.USAGE_LIMIT_EXCEEDED,
      message,
      'You have reached your usage limit. Please upgrade your plan or wait until next month.',
      context
    );
    this.name = 'UsageLimitError';
    this.limit = limit;
    this.current = current;
  }
}

// ============================================================================
// Type Guards
// ============================================================================

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAbortError = (error: unknown): boolean => {
  return error instanceof Error && error.name === 'AbortError';
};

// ============================================================================
// Error Parsing & Extraction
// ============================================================================

/**
 * Extracts a user-friendly error message from any error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.userMessage;
  }

  if (isAbortError(error)) {
    return 'Request was cancelled.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Extracts technical details for logging
 */
export const getErrorDetails = (error: unknown): string => {
  if (isAppError(error)) {
    return JSON.stringify({
      name: error.name,
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp,
      stack: error.stack,
    }, null, 2);
  }

  if (error instanceof Error) {
    return JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack,
    }, null, 2);
  }

  return String(error);
};

// ============================================================================
// Error Logging
// ============================================================================

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  error?: unknown;
  context?: ErrorContext;
  timestamp: Date;
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  log(level: LogLevel, message: string, error?: unknown, context?: ErrorContext) {
    const entry: LogEntry = {
      level,
      message,
      error,
      context,
      timestamp: new Date(),
    };

    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging based on level
    const contextStr = context ? ` [${context.component || 'Unknown'}${context.action ? `:${context.action}` : ''}]` : '';
    const fullMessage = `${contextStr} ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, error);
        break;
      case LogLevel.INFO:
        console.info(fullMessage, error);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, error);
        break;
      case LogLevel.ERROR:
        console.error(fullMessage, error);
        if (isAppError(error)) {
          console.error('Error details:', getErrorDetails(error));
        }
        break;
    }

    // In production, you would send errors to a logging service here
    // Example: Sentry, LogRocket, Datadog, etc.
    // if (level === LogLevel.ERROR && import.meta.env.PROD) {
    //   sendToLoggingService(entry);
    // }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === LogLevel.ERROR);
  }
}

export const logger = new ErrorLogger();

// ============================================================================
// Error Handler (integrates with Toast)
// ============================================================================

interface ErrorHandlerOptions {
  showToast?: boolean;
  customMessage?: string;
  onError?: (error: AppError) => void;
}

/**
 * Central error handler that logs errors and optionally shows toast notifications
 *
 * @example
 * try {
 *   await generateContent();
 * } catch (error) {
 *   handleError(error, { component: 'CvBuilder', action: 'generate' });
 * }
 */
export const handleError = (
  error: unknown,
  context?: ErrorContext,
  options: ErrorHandlerOptions = {}
): AppError => {
  const { showToast = false, customMessage, onError } = options;

  // Convert to AppError if it isn't already
  let appError: AppError;

  if (isAppError(error)) {
    appError = error;
    // Add context if not already present
    if (context && !error.context) {
      appError.context = context;
    }
  } else if (isAbortError(error)) {
    // Don't log abort errors - they're expected when users cancel
    return new AppError(
      ErrorCode.UNKNOWN_ERROR,
      'Request aborted',
      'Request was cancelled.',
      context,
      error
    );
  } else {
    // Wrap unknown errors
    const message = error instanceof Error ? error.message : String(error);
    appError = new AppError(
      ErrorCode.UNKNOWN_ERROR,
      message,
      customMessage || 'An unexpected error occurred. Please try again.',
      context,
      error
    );
  }

  // Log the error
  logger.log(LogLevel.ERROR, appError.message, appError, appError.context);

  // Call custom error handler if provided
  if (onError) {
    onError(appError);
  }

  // Note: Toast integration would go here if showToast is true
  // This requires the toast context, which should be passed in or accessed via a hook
  // For now, we're returning the error and letting the caller handle UI

  return appError;
};

// ============================================================================
// Error Creation Helpers
// ============================================================================

/**
 * Creates an error from a fetch response
 */
export const createApiErrorFromResponse = async (
  response: Response,
  context?: ErrorContext
): Promise<ApiError> => {
  let message = `API error: ${response.status} ${response.statusText}`;

  try {
    const data = await response.json();
    if (data.error || data.message) {
      message = data.error || data.message;
    }
  } catch {
    // Response is not JSON, use status text
  }

  return new ApiError(message, response.status, context);
};

/**
 * Creates a network error from a fetch error
 */
export const createNetworkError = (
  error: unknown,
  context?: ErrorContext
): NetworkError => {
  const message = error instanceof Error ? error.message : 'Network request failed';

  // Check if offline
  if (!navigator.onLine) {
    return new NetworkError('No internet connection', context, error);
  }

  return new NetworkError(message, context, error);
};

// ============================================================================
// Async Error Wrapper
// ============================================================================

/**
 * Wraps an async function with error handling
 *
 * @example
 * const safeGenerate = withErrorHandling(
 *   generateContent,
 *   { component: 'CvBuilder', action: 'generate' }
 * );
 *
 * const result = await safeGenerate(params);
 */
export const withErrorHandling = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context: ErrorContext,
  options?: ErrorHandlerOptions
): T => {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, context, options);
    }
  }) as T;
};
