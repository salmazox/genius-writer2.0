/**
 * Feature-specific Error Boundary wrapper
 * Provides context-aware error handling for different features
 */

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorContext } from '../utils/errorHandler';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
}

/**
 * Wraps a feature component with an error boundary that includes context
 */
export const FeatureErrorBoundary: React.FC<FeatureErrorBoundaryProps> = ({
  children,
  featureName,
  fallback,
}) => {
  const context: ErrorContext = {
    component: featureName,
  };

  return (
    <ErrorBoundary context={context} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};

/**
 * Specific error boundaries for major features
 */

export const CvBuilderErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="CvBuilder">
    {children}
  </FeatureErrorBoundary>
);

export const GenericToolErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="GenericTool">
    {children}
  </FeatureErrorBoundary>
);

export const SmartEditorErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="SmartEditor">
    {children}
  </FeatureErrorBoundary>
);

export const TranslatorErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="Translator">
    {children}
  </FeatureErrorBoundary>
);
