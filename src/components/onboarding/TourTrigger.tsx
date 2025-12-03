/**
 * Tour Trigger Component
 *
 * Button to manually start a tour
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface TourTriggerProps {
  tourId: string;
  label?: string;
  className?: string;
  variant?: 'button' | 'icon';
}

export const TourTrigger: React.FC<TourTriggerProps> = ({
  tourId,
  label = 'Start Tour',
  className = '',
  variant = 'button'
}) => {
  const { startTour } = useOnboarding();

  const handleClick = () => {
    startTour(tourId);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
        aria-label={label}
        title={label}
      >
        <HelpCircle size={20} className="text-gray-600" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium ${className}`}
    >
      <HelpCircle size={18} />
      <span>{label}</span>
    </button>
  );
};
