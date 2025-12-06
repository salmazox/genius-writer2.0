/**
 * Activity Feed Component
 *
 * Displays recent activity for a document including creates, edits, comments, shares, and resolutions.
 * Fully mobile-responsive with touch-friendly interface.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Edit2, MessageCircle, Share2, CheckCircle, Clock, Filter, X } from 'lucide-react';
import {
  getActivity,
  timeAgo,
  Activity
} from '../services/collaboration';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface ActivityFeedProps {
  documentId: string;
  limit?: number;
  onClose?: () => void;
}

interface ActivityIconConfig {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const getActivityIcon = (type: Activity['type']): ActivityIconConfig => {
  switch (type) {
    case 'create':
      return {
        icon: <FileText size={16} />,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-600 dark:text-blue-400'
      };
    case 'edit':
      return {
        icon: <Edit2 size={16} />,
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-600 dark:text-amber-400'
      };
    case 'comment':
      return {
        icon: <MessageCircle size={16} />,
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-600 dark:text-purple-400'
      };
    case 'share':
      return {
        icon: <Share2 size={16} />,
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-600 dark:text-green-400'
      };
    case 'resolve':
      return {
        icon: <CheckCircle size={16} />,
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-600 dark:text-emerald-400'
      };
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  documentId,
  limit = 20,
  onClose
}) => {
  const { t } = useThemeLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');
  const [displayLimit, setDisplayLimit] = useState(limit);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load activities
  useEffect(() => {
    const allActivities = getActivity(documentId, 100); // Get more for filtering
    setActivities(allActivities);
  }, [documentId, refreshKey]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filter === 'all') {
      return activities.slice(0, displayLimit);
    }
    return activities.filter(a => a.type === filter).slice(0, displayLimit);
  }, [activities, filter, displayLimit]);

  // Check if there are more activities to load
  const hasMore = useMemo(() => {
    const totalFiltered = filter === 'all'
      ? activities.length
      : activities.filter(a => a.type === filter).length;
    return totalFiltered > displayLimit;
  }, [activities, filter, displayLimit]);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setDisplayLimit(limit);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{t('ui.activityFeed.title')}</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors lg:hidden"
              title="Close"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Filter size={14} />
            {t('ui.activityFeed.all')}
          </button>
          <button
            onClick={() => setFilter('comment')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filter === 'comment'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <MessageCircle size={14} />
            {t('ui.activityFeed.comments')}
          </button>
          <button
            onClick={() => setFilter('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filter === 'edit'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Edit2 size={14} />
            {t('ui.activityFeed.edits')}
          </button>
          <button
            onClick={() => setFilter('share')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filter === 'share'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Share2 size={14} />
            {t('ui.activityFeed.suggestions')}
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
              {t('ui.activityFeed.noActivity')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const iconConfig = getActivityIcon(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconConfig.bgColor} ${iconConfig.textColor} flex items-center justify-center`}>
                    {iconConfig.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base text-slate-900 dark:text-white">
                          <span className="font-semibold">{activity.userName}</span>
                          {' '}
                          <span className="text-slate-600 dark:text-slate-400">
                            {activity.description}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {timeAgo(activity.timestamp)}
                        </p>
                      </div>

                      {/* Activity Type Badge (mobile) */}
                      <span className={`md:hidden flex-shrink-0 px-2 py-0.5 ${iconConfig.bgColor} ${iconConfig.textColor} rounded-full text-xs font-medium capitalize`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>

                  {/* Activity Type Badge (desktop) */}
                  <span className={`hidden md:inline-flex flex-shrink-0 px-3 py-1 ${iconConfig.bgColor} ${iconConfig.textColor} rounded-full text-xs font-medium capitalize`}>
                    {activity.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && filteredActivities.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              {t('ui.activityFeed.loadMore')}
            </button>
          </div>
        )}
      </div>

      {/* Refresh Button (Fixed at bottom on mobile) */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0 lg:hidden">
        <button
          onClick={handleRefresh}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Clock size={16} />
          {t('ui.activityFeed.all')}
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
