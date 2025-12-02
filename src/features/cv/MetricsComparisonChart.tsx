/**
 * Metrics Comparison Chart Component
 *
 * Visualizes success metrics comparison across CV versions
 * Shows interview and offer rates with trend indicators
 */

import React from 'react';
import { TrendingUp, TrendingDown, Award, Briefcase, CheckCircle } from 'lucide-react';
import { type CVVersion } from '../../services/versionHistory';

// ============================================================================
// INTERFACES
// ============================================================================

interface MetricsComparisonChartProps {
  versions: CVVersion[];
  className?: string;
}

interface VersionMetrics {
  version: CVVersion;
  interviewRate: number;
  offerRate: number;
  totalApplications: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MetricsComparisonChart: React.FC<MetricsComparisonChartProps> = ({
  versions,
  className = ''
}) => {
  // Filter versions with metrics
  const versionsWithMetrics = versions.filter(
    v => v.metrics && (v.metrics.applicationsSubmitted || 0) > 0
  );

  if (versionsWithMetrics.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center ${className}`}>
        <Briefcase size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          No Metrics Data Yet
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Track applications, interviews, and offers for each CV version to see comparison charts
        </p>
      </div>
    );
  }

  // Calculate metrics for each version
  const metricsData: VersionMetrics[] = versionsWithMetrics.map(version => {
    const apps = version.metrics?.applicationsSubmitted || 0;
    const interviews = version.metrics?.interviewsReceived || 0;
    const offers = version.metrics?.offersReceived || 0;

    return {
      version,
      interviewRate: apps > 0 ? Math.round((interviews / apps) * 100) : 0,
      offerRate: apps > 0 ? Math.round((offers / apps) * 100) : 0,
      totalApplications: apps
    };
  }).reverse(); // Chronological order (oldest to newest)

  // Calculate overall statistics
  const totalApps = metricsData.reduce((sum, m) => sum + m.totalApplications, 0);
  const totalInterviews = versionsWithMetrics.reduce((sum, v) => sum + (v.metrics?.interviewsReceived || 0), 0);
  const totalOffers = versionsWithMetrics.reduce((sum, v) => sum + (v.metrics?.offersReceived || 0), 0);
  const overallInterviewRate = totalApps > 0 ? Math.round((totalInterviews / totalApps) * 100) : 0;
  const overallOfferRate = totalApps > 0 ? Math.round((totalOffers / totalApps) * 100) : 0;

  // Find best performing version
  const bestVersion = metricsData.reduce((best, current) =>
    current.offerRate > best.offerRate ? current : best
  );

  // Calculate trend (comparing first half vs second half)
  const midpoint = Math.floor(metricsData.length / 2);
  const firstHalfAvg = metricsData.slice(0, midpoint).reduce((sum, m) => sum + m.offerRate, 0) / midpoint || 0;
  const secondHalfAvg = metricsData.slice(midpoint).reduce((sum, m) => sum + m.offerRate, 0) / (metricsData.length - midpoint) || 0;
  const trend = secondHalfAvg - firstHalfAvg;

  const maxRate = Math.max(...metricsData.map(m => Math.max(m.interviewRate, m.offerRate)), 100);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase">Total Apps</span>
          </div>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalApps}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Across {versionsWithMetrics.length} version{versionsWithMetrics.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-xs font-bold text-green-900 dark:text-green-200 uppercase">Interview Rate</span>
          </div>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{overallInterviewRate}%</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {totalInterviews} interviews total
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase">Offer Rate</span>
          </div>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{overallOfferRate}%</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            {totalOffers} offers total
          </p>
        </div>
      </div>

      {/* Trend Indicator */}
      {metricsData.length >= 4 && (
        <div className={`p-4 rounded-xl border ${
          trend > 5
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : trend < -5
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-start gap-3">
            {trend > 5 ? (
              <TrendingUp size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : trend < -5 ? (
              <TrendingDown size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <TrendingUp size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h5 className={`text-sm font-bold mb-1 ${
                trend > 5
                  ? 'text-green-900 dark:text-green-200'
                  : trend < -5
                  ? 'text-red-900 dark:text-red-200'
                  : 'text-yellow-900 dark:text-yellow-200'
              }`}>
                {trend > 5 ? 'Improving Performance' : trend < -5 ? 'Declining Performance' : 'Stable Performance'}
              </h5>
              <p className={`text-xs ${
                trend > 5
                  ? 'text-green-700 dark:text-green-300'
                  : trend < -5
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {trend > 5 && `Your recent CV versions are performing ${Math.abs(Math.round(trend))}% better on average`}
                {trend < -5 && `Your recent CV versions are performing ${Math.abs(Math.round(trend))}% worse on average`}
                {trend >= -5 && trend <= 5 && 'Your CV versions are performing consistently'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">
          Success Rate Comparison
        </h4>

        <div className="space-y-6">
          {metricsData.map((data, index) => (
            <div key={data.version.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {data.version.metadata.name}
                  </h5>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(data.version.timestamp)}
                  </span>
                  {data.version.id === bestVersion.version.id && data.offerRate > 0 && (
                    <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-bold flex items-center gap-1">
                      <Award size={10} />
                      Best
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {data.totalApplications} apps
                </span>
              </div>

              <div className="space-y-2">
                {/* Interview Rate Bar */}
                <div className="relative">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Interview Rate</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{data.interviewRate}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min((data.interviewRate / maxRate) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Offer Rate Bar */}
                <div className="relative">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Offer Rate</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{data.offerRate}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min((data.offerRate / maxRate) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {index < metricsData.length - 1 && (
                <div className="mt-4 border-b border-slate-200 dark:border-slate-800" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Best Version Highlight */}
      {bestVersion.offerRate > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-start gap-3">
            <Award size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                Best Performing Version
              </h5>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                <strong>{bestVersion.version.metadata.name}</strong> achieved the highest offer rate at{' '}
                <strong>{bestVersion.offerRate}%</strong>
                {bestVersion.version.atsScore && (
                  <> with an ATS score of <strong>{bestVersion.version.atsScore.overall}%</strong></>
                )}
              </p>
              {bestVersion.version.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bestVersion.version.metadata.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsComparisonChart;
