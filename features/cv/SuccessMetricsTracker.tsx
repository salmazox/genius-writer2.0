/**
 * Success Metrics Tracker Component
 *
 * Tracks job search success metrics per CV version
 * (Applications, Interviews, Offers)
 */

import React, { useState } from 'react';
import { Briefcase, CheckCircle, TrendingUp, X, Plus, Edit2, Save } from 'lucide-react';
import { updateVersionMetrics, type CVVersion } from '../../services/versionHistory';

// ============================================================================
// INTERFACES
// ============================================================================

interface SuccessMetricsTrackerProps {
  version: CVVersion;
  onUpdate: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const SuccessMetricsTracker: React.FC<SuccessMetricsTrackerProps> = ({
  version,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [applications, setApplications] = useState(version.metrics?.applicationsSubmitted || 0);
  const [interviews, setInterviews] = useState(version.metrics?.interviewsReceived || 0);
  const [offers, setOffers] = useState(version.metrics?.offersReceived || 0);

  const handleSave = () => {
    updateVersionMetrics(version.id, {
      applicationsSubmitted: applications,
      interviewsReceived: interviews,
      offersReceived: offers
    });
    setIsEditing(false);
    onUpdate();
  };

  const handleCancel = () => {
    setApplications(version.metrics?.applicationsSubmitted || 0);
    setInterviews(version.metrics?.interviewsReceived || 0);
    setOffers(version.metrics?.offersReceived || 0);
    setIsEditing(false);
  };

  // Calculate success rates
  const interviewRate = applications > 0 ? Math.round((interviews / applications) * 100) : 0;
  const offerRate = applications > 0 ? Math.round((offers / applications) * 100) : 0;
  const interviewToOfferRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

  const hasMetrics = (version.metrics?.applicationsSubmitted || 0) > 0;

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h6 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1">
          <Briefcase size={12} />
          Success Metrics
        </h6>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
          >
            {hasMetrics ? <Edit2 size={12} /> : <Plus size={12} />}
            {hasMetrics ? 'Edit' : 'Add Metrics'}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center gap-1"
            >
              <Save size={12} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <X size={12} className="text-slate-500" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        // Edit Mode
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
              Applications Submitted
            </label>
            <input
              type="number"
              min="0"
              value={applications}
              onChange={(e) => setApplications(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
              Interviews Received
            </label>
            <input
              type="number"
              min="0"
              max={applications}
              value={interviews}
              onChange={(e) => setInterviews(Math.min(applications, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
              Offers Received
            </label>
            <input
              type="number"
              min="0"
              max={interviews}
              value={offers}
              onChange={(e) => setOffers(Math.min(interviews, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
            />
          </div>
        </div>
      ) : hasMetrics ? (
        // Display Mode with Metrics
        <div className="space-y-3">
          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {applications}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Applications
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {interviews}
              </div>
              <div className="text-xs text-green-600 dark:text-green-300 mt-1">
                Interviews
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {offers}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                Offers
              </div>
            </div>
          </div>

          {/* Success Rates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Interview Rate:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${Math.min(interviewRate, 100)}%` }}
                  />
                </div>
                <span className={`font-bold ${interviewRate >= 20 ? 'text-green-600' : interviewRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {interviewRate}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Offer Rate:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${Math.min(offerRate, 100)}%` }}
                  />
                </div>
                <span className={`font-bold ${offerRate >= 5 ? 'text-green-600' : offerRate >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {offerRate}%
                </span>
              </div>
            </div>

            {interviews > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Interview → Offer:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${Math.min(interviewToOfferRate, 100)}%` }}
                    />
                  </div>
                  <span className={`font-bold ${interviewToOfferRate >= 30 ? 'text-green-600' : interviewToOfferRate >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {interviewToOfferRate}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Success Insight */}
          {offerRate >= 5 && (
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start gap-2">
              <CheckCircle size={14} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-300">
                <strong>Great success rate!</strong> This CV version is performing well.
              </p>
            </div>
          )}

          {applications >= 10 && interviewRate < 10 && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
              <TrendingUp size={14} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Low interview rate.</strong> Consider improving your CV with AI Coach suggestions.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-4">
          <Briefcase size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track your job search success with this CV version
          </p>
        </div>
      )}
    </div>
  );
};

export default SuccessMetricsTracker;
