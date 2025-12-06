import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { logError, ErrorCategory, ErrorSeverity } from '../services/errorLogger';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  category?: ErrorCategory;
  onReset?: () => void;
  showHomeButton?: boolean;
  t?: (key: string) => string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

class ErrorBoundaryClass extends Component<Props, State> {
  // Explicitly declare props to satisfy TS
  readonly props: Readonly<Props>;

  public state: State = {
    hasError: false,
    showDetails: false
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error logging service
    logError(
      error,
      this.props.category || ErrorCategory.RENDER,
      ErrorSeverity.HIGH,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name
      }
    );

    this.setState({ errorInfo });
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private goHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    const t = this.props.t || ((key: string) => key);

    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 m-4">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
          </div>

          {/* Error Message */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {t('ui.errors.boundaryTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
            {t('ui.errors.boundaryMessage')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <button
              onClick={this.resetError}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              <RefreshCw size={18} /> {t('ui.errors.tryAgain')}
            </button>

            {this.props.showHomeButton && (
              <button
                onClick={this.goHome}
                className="flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
              >
                <Home size={18} /> {t('ui.errors.goHome')}
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw size={18} /> {t('ui.errors.reloadPage')}
            </button>
          </div>

          {/* Error Details Toggle (Development) */}
          {this.state.error && (
            <div className="w-full max-w-2xl">
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-2"
              >
                <Bug size={16} />
                <span>{this.state.showDetails ? t('ui.errors.hideDetails') : t('ui.errors.showDetails')}</span>
                {this.state.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {this.state.showDetails && (
                <div className="bg-slate-900 text-slate-200 rounded-lg p-4 text-left">
                  {/* Error Message */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-red-400 mb-1">{t('ui.errors.errorMessage')}</div>
                    <div className="text-sm font-mono">{this.state.error.message}</div>
                  </div>

                  {/* Stack Trace */}
                  {this.state.error.stack && (
                    <div className="mb-4">
                      <div className="text-xs font-bold text-yellow-400 mb-1">{t('ui.errors.stackTrace')}</div>
                      <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-64">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <div className="text-xs font-bold text-blue-400 mb-1">{t('ui.errors.componentStack')}</div>
                      <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Support Message */}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
            {t('ui.errors.supportMessage')}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that provides translations to the class component
export const ErrorBoundary: React.FC<Omit<Props, 't'>> = (props) => {
  const { t } = useThemeLanguage();
  return <ErrorBoundaryClass {...props} t={t} />;
};
