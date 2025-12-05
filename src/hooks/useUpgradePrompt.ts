import { useState } from 'react';

export interface LimitError {
  error: string;
  message: string;
  currentUsage?: number;
  limit?: number;
  plan?: string;
  upgradeUrl?: string;
}

export interface UpgradePromptState {
  isOpen: boolean;
  limitType?: 'aiGenerations' | 'documents' | 'storage' | 'feature';
  feature?: string;
  currentPlan?: string;
  message?: string;
}

export const useUpgradePrompt = () => {
  const [promptState, setPromptState] = useState<UpgradePromptState>({
    isOpen: false,
  });

  /**
   * Handle API errors and show upgrade prompt if it's a limit error
   */
  const handleApiError = (error: any): boolean => {
    // Check if it's a limit error (429 or 403 status)
    if (error?.status === 429 || error?.status === 403) {
      const errorData: LimitError = error.data || error;

      // Determine limit type from error message
      let limitType: 'aiGenerations' | 'documents' | 'storage' | 'feature' = 'aiGenerations';
      let feature: string | undefined;

      if (errorData.error?.includes('Document limit')) {
        limitType = 'documents';
      } else if (errorData.error?.includes('Storage limit')) {
        limitType = 'storage';
      } else if (errorData.error?.includes('AI') || errorData.error?.includes('generation')) {
        limitType = 'aiGenerations';
      } else if (errorData.error?.includes('Feature') || errorData.error?.includes('not available')) {
        limitType = 'feature';
        feature = errorData.error;
      }

      setPromptState({
        isOpen: true,
        limitType,
        feature,
        currentPlan: errorData.plan,
        message: errorData.message,
      });

      return true; // Error was handled
    }

    return false; // Error was not a limit error
  };

  /**
   * Show upgrade prompt manually
   */
  const showUpgradePrompt = (
    limitType: 'aiGenerations' | 'documents' | 'storage' | 'feature',
    options?: {
      feature?: string;
      currentPlan?: string;
      message?: string;
    }
  ) => {
    setPromptState({
      isOpen: true,
      limitType,
      ...options,
    });
  };

  /**
   * Close upgrade prompt
   */
  const closeUpgradePrompt = () => {
    setPromptState({
      isOpen: false,
    });
  };

  return {
    promptState,
    handleApiError,
    showUpgradePrompt,
    closeUpgradePrompt,
  };
};
