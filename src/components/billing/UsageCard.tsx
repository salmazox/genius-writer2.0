/**
 * Usage Card Component
 *
 * Displays usage metrics with progress bars and upgrade prompts
 */

import React from 'react';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { SubscriptionTier } from '../../config/pricing';

interface UsageMetric {
  label: string;
  current: number;
  limit: number;
  unit: string;
  icon?: React.ReactNode;
}

interface UsageCardProps {
  tier: SubscriptionTier;
  metrics: UsageMetric[];
  daysUntilReset: number;
  onUpgrade?: () => void;
}

export const UsageCard: React.FC<UsageCardProps> = ({
  tier,
  metrics,
  daysUntilReset,
  onUpgrade
}) => {
  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageTextColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const calculatePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(100, Math.round((current / limit) * 100));
  };

  const hasHighUsage = metrics.some(m => {
    if (m.limit === -1) return false;
    return calculatePercentage(m.current, m.limit) >= 75;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Usage Overview
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Current plan: <span className="font-semibold capitalize">{tier}</span>
          </p>
        </div>
        {hasHighUsage && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <TrendingUp size={16} />
            Upgrade
          </button>
        )}
      </div>

      {/* Usage Metrics */}
      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const percentage = calculatePercentage(metric.current, metric.limit);
          const isUnlimited = metric.limit === -1;
          const isWarning = percentage >= 75;

          return (
            <div key={index}>
              {/* Metric Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon && (
                    <div className="text-slate-600 dark:text-slate-400">
                      {metric.icon}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {metric.label}
                  </span>
                </div>
                <div className="text-right">
                  {isUnlimited ? (
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      Unlimited
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${getUsageTextColor(percentage)}`}>
                        {metric.current} / {metric.limit}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {metric.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {!isUnlimited && (
                <>
                  <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getUsageColor(percentage)} transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 0 && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Percentage */}
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs font-medium ${getUsageTextColor(percentage)}`}>
                      {percentage}% used
                    </span>
                    {isWarning && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                        <AlertCircle size={12} />
                        Nearing limit
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset Notice */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Zap size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span>
            Usage resets in <span className="font-semibold text-slate-900 dark:text-white">{daysUntilReset} days</span>
          </span>
        </div>
      </div>

      {/* Upgrade Prompt (if high usage) */}
      {hasHighUsage && onUpgrade && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-300 mb-1">
                Running low on resources
              </h4>
              <p className="text-xs text-yellow-800 dark:text-yellow-400 mb-3">
                You're approaching your plan limits. Upgrade now to unlock more capacity.
              </p>
              <button
                onClick={onUpgrade}
                className="text-xs font-medium text-yellow-900 dark:text-yellow-300 hover:underline"
              >
                View upgrade options →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
