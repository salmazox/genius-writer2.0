import React, { useState, useEffect } from 'react';
import { Activity, FileText, Zap, HardDrive, TrendingUp } from 'lucide-react';
import { usageService, UsageStats as UsageStatsType } from '../../services/usageService';

interface UsageCardProps {
  icon: React.ReactNode;
  title: string;
  current: number | string;
  limit: number | string;
  percentage: number;
  unit: string;
}

const UsageCard: React.FC<UsageCardProps> = ({ icon, title, current, limit, percentage, unit }) => {
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBackgroundColor = () => {
    if (percentage >= 90) return 'bg-red-50 dark:bg-red-900/20';
    if (percentage >= 75) return 'bg-orange-50 dark:bg-orange-900/20';
    if (percentage >= 50) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-green-50 dark:bg-green-900/20';
  };

  const formatValue = (value: number | string) => {
    if (value === 'unlimited' || value === -1) return '∞';
    return value;
  };

  return (
    <div className={`p-4 rounded-lg border ${getBackgroundColor()} border-slate-200 dark:border-slate-700`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-slate-600 dark:text-slate-400">{icon}</div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {formatValue(current)} / {formatValue(limit)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Status Message */}
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        {limit === 'unlimited' || limit === -1
          ? `${current} ${unit} used`
          : percentage >= 100
          ? '⚠️ Limit reached! Upgrade to continue.'
          : `${typeof limit === 'number' && typeof current === 'number' ? limit - current : 0} ${unit} remaining`}
      </p>
    </div>
  );
};

export const UsageStats: React.FC = () => {
  const [stats, setStats] = useState<UsageStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      setLoading(true);
      const data = await usageService.getUsageStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load usage stats:', err);
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center text-red-600 dark:text-red-400">
          {error || 'Unable to load usage statistics'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <Activity className="mr-2" size={24} />
            Usage Statistics
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Current plan: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stats.plan}</span>
          </p>
        </div>
        <button
          onClick={loadUsageStats}
          className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Usage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* AI Generations */}
        <UsageCard
          icon={<Zap size={20} />}
          title="AI Generations"
          current={stats.usage.aiGenerations.current}
          limit={stats.usage.aiGenerations.limit}
          percentage={stats.usage.aiGenerations.percentage}
          unit="generations"
        />

        {/* Documents */}
        <UsageCard
          icon={<FileText size={20} />}
          title="Documents"
          current={stats.usage.documents.currentMonth}
          limit={stats.usage.documents.limit}
          percentage={stats.usage.documents.percentage}
          unit="documents"
        />

        {/* Storage */}
        <UsageCard
          icon={<HardDrive size={20} />}
          title="Storage"
          current={stats.usage.storage.used}
          limit={stats.usage.storage.limit}
          percentage={stats.usage.storage.percentage}
          unit=""
        />
      </div>

      {/* Plan Features */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center">
          <TrendingUp size={16} className="mr-2" />
          Available Features
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(stats.features).map(([feature, enabled]) => (
            <div
              key={feature}
              className={`px-3 py-2 rounded-lg text-sm ${
                enabled
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-500'
              }`}
            >
              <span className="mr-2">{enabled ? '✓' : '✗'}</span>
              {feature.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA if needed */}
      {(stats.usage.aiGenerations.percentage >= 80 ||
        stats.usage.documents.percentage >= 80 ||
        stats.usage.storage.percentage >= 80) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
                Running low on resources?
              </h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                Upgrade your plan to get more AI generations, documents, and storage.
              </p>
            </div>
            <a
              href="/pricing"
              className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
            >
              Upgrade Plan
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
