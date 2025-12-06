/**
 * Onboarding Context
 *
 * Manages tour state and provides tour control functions
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Tour, TourStep, getTour, markTourCompleted, hasCompletedTour } from '../config/tourSteps';

interface OnboardingContextType {
  activeTour: Tour | null;
  currentStep: number;
  isRunning: boolean;
  startTour: (tourId: string) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  goToStep: (stepIndex: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  /**
   * Start a tour by ID
   */
  const startTour = useCallback((tourId: string) => {
    const tour = getTour(tourId);
    if (!tour) {
      console.warn(`Tour not found: ${tourId}`);
      return;
    }

    // Check if tour was already completed
    if (hasCompletedTour(tourId) && !tour.autoStart) {
      return;
    }

    setActiveTour(tour);
    setCurrentStep(0);
    setIsRunning(true);
  }, []);

  /**
   * Stop the current tour
   */
  const stopTour = useCallback(() => {
    setActiveTour(null);
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  /**
   * Move to next step
   */
  const nextStep = useCallback(() => {
    if (!activeTour) return;

    if (currentStep < activeTour.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Last step, complete tour
      completeTour();
    }
  }, [activeTour, currentStep]);

  /**
   * Move to previous step
   */
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  /**
   * Skip the tour
   */
  const skipTour = useCallback(() => {
    if (activeTour) {
      markTourCompleted(activeTour.id);
    }
    stopTour();
  }, [activeTour, stopTour]);

  /**
   * Complete the tour
   */
  const completeTour = useCallback(() => {
    if (activeTour) {
      markTourCompleted(activeTour.id);
    }
    stopTour();
  }, [activeTour, stopTour]);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((stepIndex: number) => {
    if (!activeTour) return;
    if (stepIndex < 0 || stepIndex >= activeTour.steps.length) return;
    setCurrentStep(stepIndex);
  }, [activeTour]);

  /**
   * Auto-start first-time user tour
   */
  useEffect(() => {
    const hasSeenTour = hasCompletedTour('first-time-user');
    if (!hasSeenTour) {
      // Delay to allow page to render
      const timer = setTimeout(() => {
        startTour('first-time-user');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [startTour]);

  const value: OnboardingContextType = {
    activeTour,
    currentStep,
    isRunning,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    goToStep
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

/**
 * Hook to use onboarding context
 */
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
