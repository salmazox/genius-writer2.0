/**
 * Onboarding Tour Component
 *
 * Displays interactive tour with highlighted elements and step-by-step tooltips
 */

import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TourStep } from '../../config/tourSteps';

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const OnboardingTour: React.FC = () => {
  const {
    activeTour,
    currentStep,
    isRunning,
    nextStep,
    prevStep,
    skipTour,
    completeTour
  } = useOnboarding();

  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStepData: TourStep | undefined = activeTour?.steps[currentStep];

  /**
   * Calculate tooltip position based on target element and placement
   */
  const calculatePosition = (rect: DOMRect, placement: TourStep['placement'] = 'bottom'): TooltipPosition => {
    const padding = 20;
    const tooltipWidth = 400;
    const tooltipHeight = 200; // Approximate

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 10) left = 10;
    if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
    if (top < 10) top = 10;
    if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;

    return { top, left, placement: placement || 'bottom' };
  };

  /**
   * Update target element highlight and tooltip position
   */
  useEffect(() => {
    if (!isRunning || !currentStepData) {
      setTooltipPosition(null);
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStepData.target);

      if (!targetElement) {
        // Target not found, use body as fallback
        const bodyRect = document.body.getBoundingClientRect();
        setTargetRect(null);
        setTooltipPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 200,
          placement: 'top'
        });
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
      setTooltipPosition(calculatePosition(rect, currentStepData.placement));
    };

    // Initial position
    updatePosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isRunning, currentStepData, currentStep]);

  if (!isRunning || !activeTour || !currentStepData) {
    return null;
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === activeTour.steps.length - 1;
  const progress = ((currentStep + 1) / activeTour.steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Darkened background */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Spotlight cutout */}
        {targetRect && (
          <div
            className="absolute bg-transparent border-4 border-white rounded-lg shadow-2xl pointer-events-auto"
            style={{
              top: targetRect.top - (currentStepData.spotlightPadding || 10),
              left: targetRect.left - (currentStepData.spotlightPadding || 10),
              width: targetRect.width + (currentStepData.spotlightPadding || 10) * 2,
              height: targetRect.height + (currentStepData.spotlightPadding || 10) * 2,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        )}

        {/* Pulsing beacon */}
        {!currentStepData.disableBeacon && targetRect && (
          <div
            className="absolute w-6 h-6 rounded-full bg-indigo-500 animate-ping"
            style={{
              top: targetRect.top + targetRect.height / 2 - 12,
              left: targetRect.left + targetRect.width / 2 - 12,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      {tooltipPosition && (
        <div
          ref={tooltipRef}
          className="fixed z-[60] w-[400px] pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">
                    {currentStepData.title}
                  </h3>
                  {activeTour.showProgress && (
                    <div className="text-sm text-indigo-100">
                      Step {currentStep + 1} of {activeTour.steps.length}
                    </div>
                  )}
                </div>
                <button
                  onClick={skipTour}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close tour"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Progress bar */}
              {activeTour.showProgress && (
                <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <p className="text-gray-700 leading-relaxed">
                {currentStepData.content}
              </p>

              {/* Custom action */}
              {currentStepData.action && (
                <button
                  onClick={currentStepData.action.onClick}
                  className="mt-4 w-full py-2 px-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                >
                  {currentStepData.action.label}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex items-center justify-between">
              <button
                onClick={skipTour}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip tour
              </button>

              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    aria-label="Previous step"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                )}

                <button
                  onClick={isLastStep ? completeTour : nextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {isLastStep ? (
                    <>
                      <Check size={18} />
                      <span>Complete</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Arrow pointer */}
          <div
            className={`absolute w-0 h-0 ${
              tooltipPosition.placement === 'top'
                ? 'bottom-[-8px] left-1/2 -translate-x-1/2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white'
                : tooltipPosition.placement === 'bottom'
                ? 'top-[-8px] left-1/2 -translate-x-1/2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white'
                : tooltipPosition.placement === 'left'
                ? 'right-[-8px] top-1/2 -translate-y-1/2 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white'
                : 'left-[-8px] top-1/2 -translate-y-1/2 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white'
            }`}
          />
        </div>
      )}

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
};
