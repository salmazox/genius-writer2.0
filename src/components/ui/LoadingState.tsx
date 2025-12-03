/**
 * Loading State Component
 *
 * Wrapper component for showing loading states with spinners and messages
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  /** Message to display below the spinner */
  message?: string;
  /** Size of the spinner: sm (16px), md (32px), lg (48px), xl (64px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show the loading state fullscreen */
  fullscreen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Show loading message */
  showMessage?: boolean;
}

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 48,
  xl: 64
};

/**
 * Loading spinner with optional message
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  fullscreen = false,
  className = '',
  showMessage = true
}) => {
  const containerClasses = fullscreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <Loader2
          size={sizeMap[size]}
          className="animate-spin text-indigo-600 dark:text-indigo-400"
        />
        {showMessage && (
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Inline loading spinner (for buttons, etc.)
 */
export const InlineLoader: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className = ''
}) => {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-current ${className}`}
    />
  );
};

/**
 * Button with loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  loadingText,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {loading && <InlineLoader size={16} />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
};

/**
 * Section loading overlay
 * Shows loading state over a specific section
 */
export const SectionLoader: React.FC<{
  loading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ loading, message = 'Loading...', children, className = '' }) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm opacity-50 pointer-events-none">
        {children}
      </div>

      {/* Loading overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50">
        <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
          <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Progress bar loader
 */
export const ProgressLoader: React.FC<{
  progress?: number; // 0-100
  message?: string;
  showPercentage?: boolean;
}> = ({ progress = 0, message = 'Processing...', showPercentage = true }) => {
  return (
    <div className="w-full">
      {message && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {message}
          </p>
          {showPercentage && (
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="h-full w-full bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

/**
 * Dots loader (three animated dots)
 */
export const DotsLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" />
    </div>
  );
};

/**
 * Pulse loader (pulsing circle)
 */
export const PulseLoader: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping opacity-75" />
      <div className="relative rounded-full bg-indigo-600 dark:bg-indigo-400 w-full h-full flex items-center justify-center">
        <div className="w-1/2 h-1/2 rounded-full bg-white dark:bg-slate-900" />
      </div>
    </div>
  );
};

/**
 * Typing indicator (like chat apps)
 */
export const TypingIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-full w-fit ${className}`}>
      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
    </div>
  );
};
