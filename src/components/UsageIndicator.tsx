import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { usageService, UsageStats } from '../services/usageService';

interface UsageIndicatorProps {
  compact?: boolean;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({ compact = false }) => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await usageService.getUsageStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return null;
  }

  const isNearLimit =
    stats.usage.aiGenerations.percentage >= 80 ||
    stats.usage.documents.percentage >= 80 ||
    stats.usage.storage.percentage >= 80;

  const atLimit =
    stats.usage.aiGenerations.percentage >= 100 ||
    stats.usage.documents.percentage >= 100 ||
    stats.usage.storage.percentage >= 100;

  if (compact) {
    return (
      <div
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
          atLimit
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            : isNearLimit
            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        }`}
      >
        {atLimit ? (
          <AlertTriangle size={16} />
        ) : (
          <Zap size={16} className={isNearLimit ? 'text-orange-500' : 'text-green-500'} />
        )}
        <span className="font-medium">
          {stats.usage.aiGenerations.current}/{usageService.formatLimit(stats.usage.aiGenerations.limit)} AI
        </span>
        {atLimit && (
          <a
            href="/pricing"
            className="ml-2 text-xs underline hover:no-underline"
          >
            Upgrade
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Quick Usage
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {stats.plan} Plan
        </span>
      </div>

      <div className="space-y-3">
        {/* AI Generations */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400">AI Generations</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {stats.usage.aiGenerations.current}/{usageService.formatLimit(stats.usage.aiGenerations.limit)}
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                stats.usage.aiGenerations.percentage >= 90
                  ? 'bg-red-500'
                  : stats.usage.aiGenerations.percentage >= 75
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(stats.usage.aiGenerations.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Documents */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400">Documents</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {stats.usage.documents.currentMonth}/{usageService.formatLimit(stats.usage.documents.limit)}
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                stats.usage.documents.percentage >= 90
                  ? 'bg-red-500'
                  : stats.usage.documents.percentage >= 75
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(stats.usage.documents.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400">Storage</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {stats.usage.storage.used}/{stats.usage.storage.limit}
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                stats.usage.storage.percentage >= 90
                  ? 'bg-red-500'
                  : stats.usage.storage.percentage >= 75
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(stats.usage.storage.percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {isNearLimit && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <a
            href="/pricing"
            className="block text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {atLimit ? 'Upgrade to continue →' : 'Running low? Upgrade →'}
          </a>
        </div>
      )}
    </div>
  );
};
