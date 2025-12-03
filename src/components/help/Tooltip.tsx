/**
 * Tooltip Component
 *
 * Shows helpful tooltips on hover
 */

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-900 dark:border-t-slate-100',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-slate-900 dark:border-b-slate-100',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-slate-900 dark:border-l-slate-100',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-slate-900 dark:border-r-slate-100'
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-sm font-medium text-white dark:text-slate-900 bg-slate-900 dark:bg-slate-100 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in duration-200 ${placementClasses[placement]}`}
          role="tooltip"
        >
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[placement]}`} />
        </div>
      )}
    </div>
  );
};

/**
 * Info Tooltip (with icon)
 */
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  iconSize?: number;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  placement = 'top',
  iconSize = 16,
  className = ''
}) => {
  return (
    <Tooltip content={content} placement={placement} className={className}>
      <button
        type="button"
        className="inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="More information"
      >
        <HelpCircle size={iconSize} />
      </button>
    </Tooltip>
  );
};
