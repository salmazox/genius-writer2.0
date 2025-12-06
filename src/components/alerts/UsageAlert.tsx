import React from 'react';
import { AlertTriangle, TrendingUp, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';

type UsageType = 'aiGenerations' | 'documents' | 'storage' | 'collaborators';

interface UsageAlertProps {
  type: UsageType;
  current: number;
  limit: number;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export const UsageAlert: React.FC<UsageAlertProps> = ({
  type,
  current,
  limit,
  onUpgrade,
  onDismiss,
  dismissible = true
}) => {
  const { t } = useThemeLanguage();
  const percentage = limit === -1 ? 0 : (current / limit) * 100;

  // Don't show if under 80% or unlimited
  if (percentage < 80 || limit === -1) return null;

  const getTypeLabel = () => {
    return t(`ui.usage.typeLabels.${type}` as any);
  };

  const getConfig = () => {
    const typeLabel = getTypeLabel();

    if (percentage >= 100) {
      return {
        colorClass: 'red',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        borderClass: 'border-red-200 dark:border-red-800',
        textClass: 'text-red-900 dark:text-red-100',
        subtextClass: 'text-red-700 dark:text-red-300',
        buttonClass: 'bg-red-600 hover:bg-red-700',
        icon: <AlertTriangle size={20} />,
        iconColor: 'text-red-600 dark:text-red-400',
        title: t('ui.usage.alerts.limitReachedTitle').replace('{type}', typeLabel),
        message: t('ui.usage.alerts.limitReachedMessage')
          .replace('{limit}', limit.toLocaleString())
          .replace('{type}', typeLabel),
        action: t('ui.usage.alerts.upgradeNow')
      };
    } else if (percentage >= 90) {
      return {
        colorClass: 'orange',
        bgClass: 'bg-orange-50 dark:bg-orange-900/20',
        borderClass: 'border-orange-200 dark:border-orange-800',
        textClass: 'text-orange-900 dark:text-orange-100',
        subtextClass: 'text-orange-700 dark:text-orange-300',
        buttonClass: 'bg-orange-600 hover:bg-orange-700',
        icon: <AlertTriangle size={20} />,
        iconColor: 'text-orange-600 dark:text-orange-400',
        title: t('ui.usage.alerts.almostAtLimitTitle').replace('{type}', typeLabel),
        message: t('ui.usage.alerts.almostAtLimitMessage')
          .replace('{current}', current.toLocaleString())
          .replace('{limit}', limit.toLocaleString())
          .replace('{percentage}', Math.round(percentage).toString()),
        action: t('ui.usage.alerts.viewPlans')
      };
    } else {
      return {
        colorClass: 'yellow',
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderClass: 'border-yellow-200 dark:border-yellow-800',
        textClass: 'text-yellow-900 dark:text-yellow-100',
        subtextClass: 'text-yellow-700 dark:text-yellow-300',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
        icon: <TrendingUp size={20} />,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        title: t('ui.usage.alerts.highUsageTitle').replace('{type}', typeLabel),
        message: t('ui.usage.alerts.highUsageMessage')
          .replace('{current}', current.toLocaleString())
          .replace('{limit}', limit.toLocaleString())
          .replace('{percentage}', Math.round(percentage).toString())
          .replace('{type}', typeLabel),
        action: t('ui.usage.alerts.seeUpgradeOptions')
      };
    }
  };

  const config = getConfig();

  return (
    <div className={`${config.bgClass} border ${config.borderClass} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className={`font-bold ${config.textClass} mb-1`}>
                {config.title}
              </h4>
              <p className={`text-sm ${config.subtextClass} mb-3`}>
                {config.message}
              </p>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-white dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      percentage >= 100
                        ? 'from-red-500 to-red-600'
                        : percentage >= 90
                        ? 'from-orange-500 to-orange-600'
                        : 'from-yellow-500 to-yellow-600'
                    } transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={onUpgrade}
                className={`inline-flex items-center gap-2 px-4 py-2 ${config.buttonClass} text-white rounded-lg text-sm font-medium transition-colors`}
              >
                <Zap size={16} />
                {config.action}
              </button>
            </div>

            {dismissible && onDismiss && (
              <button
                onClick={onDismiss}
                className={`${config.subtextClass} hover:${config.textClass} transition-colors flex-shrink-0`}
                aria-label="Dismiss alert"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact version for dashboard widgets
export const UsageAlertCompact: React.FC<UsageAlertProps> = ({
  type,
  current,
  limit,
  onUpgrade
}) => {
  const { t } = useThemeLanguage();
  const percentage = limit === -1 ? 0 : (current / limit) * 100;

  if (percentage < 90 || limit === -1) return null;

  const getTypeLabel = () => {
    return t(`ui.usage.typeLabels.${type}` as any);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-orange-600 dark:text-orange-400" size={16} />
        <span className="text-sm text-orange-900 dark:text-orange-100 font-medium">
          {t('ui.usage.alerts.percentUsed')
            .replace('{percentage}', Math.round(percentage).toString())
            .replace('{type}', getTypeLabel())}
        </span>
      </div>
      <button
        onClick={onUpgrade}
        className="text-sm text-orange-700 dark:text-orange-300 hover:underline font-medium"
      >
        {t('ui.usage.upgrade')}
      </button>
    </div>
  );
};
