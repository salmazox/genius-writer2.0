/**
 * Error Logging Service
 *
 * Captures, logs, and reports errors for monitoring and debugging
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  RENDER = 'render',
  NETWORK = 'network',
  AUTH = 'auth',
  STORAGE = 'storage',
  VALIDATION = 'validation',
  AI_GENERATION = 'ai_generation',
  EXPORT = 'export',
  UNKNOWN = 'unknown'
}

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userAgent: string;
  url: string;
  userId?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
}

const ERROR_LOG_KEY = 'genius_writer_error_logs';
const MAX_LOGS = 100; // Keep last 100 errors

/**
 * Log an error
 */
export function logError(
  error: Error,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  metadata?: Record<string, any>
): ErrorLog {
  const errorLog: ErrorLog = {
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    message: error.message,
    stack: error.stack,
    category,
    severity,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: getUserId(),
    metadata,
    resolved: false
  };

  // Save to localStorage
  saveErrorLog(errorLog);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error [${severity.toUpperCase()}] - ${category}`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Metadata:', metadata);
    console.groupEnd();
  }

  // In production, you would send to error reporting service
  // Example: Sentry, LogRocket, Rollbar, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorReportingService(errorLog);
  }

  return errorLog;
}

/**
 * Log a custom message as an error
 */
export function logErrorMessage(
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.LOW,
  metadata?: Record<string, any>
): void {
  const error = new Error(message);
  logError(error, category, severity, metadata);
}

/**
 * Get user ID from localStorage
 */
function getUserId(): string | undefined {
  try {
    const userStr = localStorage.getItem('ai_writer_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user.email;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Save error log to localStorage
 */
function saveErrorLog(errorLog: ErrorLog): void {
  try {
    const logs = getErrorLogs();
    logs.push(errorLog);

    // Keep only last MAX_LOGS errors
    const limitedLogs = logs.slice(-MAX_LOGS);

    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(limitedLogs));
  } catch (error) {
    console.error('Failed to save error log:', error);
  }
}

/**
 * Get all error logs
 */
export function getErrorLogs(): ErrorLog[] {
  try {
    const stored = localStorage.getItem(ERROR_LOG_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Get error logs by category
 */
export function getErrorLogsByCategory(category: ErrorCategory): ErrorLog[] {
  const logs = getErrorLogs();
  return logs.filter(log => log.category === category);
}

/**
 * Get error logs by severity
 */
export function getErrorLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
  const logs = getErrorLogs();
  return logs.filter(log => log.severity === severity);
}

/**
 * Get unresolved errors
 */
export function getUnresolvedErrors(): ErrorLog[] {
  const logs = getErrorLogs();
  return logs.filter(log => !log.resolved);
}

/**
 * Mark error as resolved
 */
export function markErrorResolved(errorId: string): void {
  try {
    const logs = getErrorLogs();
    const error = logs.find(log => log.id === errorId);
    if (error) {
      error.resolved = true;
      localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));
    }
  } catch (error) {
    console.error('Failed to mark error as resolved:', error);
  }
}

/**
 * Clear all error logs
 */
export function clearErrorLogs(): void {
  try {
    localStorage.removeItem(ERROR_LOG_KEY);
  } catch (error) {
    console.error('Failed to clear error logs:', error);
  }
}

/**
 * Get error statistics
 */
export function getErrorStatistics(): {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  unresolved: number;
  last24Hours: number;
} {
  const logs = getErrorLogs();
  const now = Date.now();
  const dayAgo = now - (24 * 60 * 60 * 1000);

  const stats = {
    total: logs.length,
    byCategory: {} as Record<ErrorCategory, number>,
    bySeverity: {} as Record<ErrorSeverity, number>,
    unresolved: logs.filter(log => !log.resolved).length,
    last24Hours: logs.filter(log => log.timestamp > dayAgo).length
  };

  // Count by category
  Object.values(ErrorCategory).forEach(category => {
    stats.byCategory[category] = logs.filter(log => log.category === category).length;
  });

  // Count by severity
  Object.values(ErrorSeverity).forEach(severity => {
    stats.bySeverity[severity] = logs.filter(log => log.severity === severity).length;
  });

  return stats;
}

/**
 * Export error logs as JSON
 */
export function exportErrorLogs(): string {
  const logs = getErrorLogs();
  const stats = getErrorStatistics();

  const exportData = {
    exportedAt: new Date().toISOString(),
    statistics: stats,
    logs: logs
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Log network error
 */
export function logNetworkError(
  url: string,
  status?: number,
  statusText?: string,
  metadata?: Record<string, any>
): void {
  const message = `Network error: ${status || 'Unknown'} ${statusText || ''} - ${url}`;
  logErrorMessage(message, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM, {
    url,
    status,
    statusText,
    ...metadata
  });
}

/**
 * Log AI generation error
 */
export function logAIError(
  toolName: string,
  error: Error,
  metadata?: Record<string, any>
): void {
  logError(error, ErrorCategory.AI_GENERATION, ErrorSeverity.HIGH, {
    toolName,
    ...metadata
  });
}

/**
 * Log storage error
 */
export function logStorageError(
  operation: string,
  error: Error,
  metadata?: Record<string, any>
): void {
  logError(error, ErrorCategory.STORAGE, ErrorSeverity.MEDIUM, {
    operation,
    ...metadata
  });
}

/**
 * Log authentication error
 */
export function logAuthError(
  error: Error,
  metadata?: Record<string, any>
): void {
  logError(error, ErrorCategory.AUTH, ErrorSeverity.HIGH, {
    ...metadata
  });
}

export default {
  logError,
  logErrorMessage,
  getErrorLogs,
  getErrorLogsByCategory,
  getErrorLogsBySeverity,
  getUnresolvedErrors,
  markErrorResolved,
  clearErrorLogs,
  getErrorStatistics,
  exportErrorLogs,
  logNetworkError,
  logAIError,
  logStorageError,
  logAuthError
};
