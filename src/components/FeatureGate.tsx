import React, { useState, useEffect } from 'react';
import { Lock, Crown } from 'lucide-react';
import { usageService } from '../services/usageService';
import { UpgradeModal } from './UpgradeModal';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradeButton?: boolean;
}

/**
 * FeatureGate Component
 * Conditionally renders children based on user's plan access to a feature
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradeButton = true,
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [requiredPlans, setRequiredPlans] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      const result = await usageService.checkFeatureAccess(feature);
      setHasAccess(result.hasAccess);
      setRequiredPlans(result.requiredPlans);
    } catch (error) {
      console.error('Failed to check feature access:', error);
      setHasAccess(false);
    }
  };

  if (hasAccess === null) {
    // Loading state
    return <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-8 w-full" />;
  }

  if (hasAccess) {
    // User has access - render children
    return <>{children}</>;
  }

  // User doesn't have access - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div className="relative">
        {/* Blurred/disabled content */}
        <div className="pointer-events-none opacity-50 blur-sm select-none">
          {children}
        </div>

        {/* Overlay with lock icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 dark:bg-slate-900/30 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-md">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
                <Crown className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Premium Feature
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              This feature requires a {requiredPlans.join(' or ')} plan
            </p>
            {showUpgradeButton && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg"
              >
                Upgrade to Unlock
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="feature"
        feature={feature}
        message={`This feature requires a ${requiredPlans.join(' or ')} plan`}
      />
    </>
  );
};

/**
 * Inline Feature Lock
 * Shows a lock icon and upgrade button without overlaying content
 */
interface FeatureLockProps {
  feature: string;
  requiredPlan?: string;
  compact?: boolean;
}

export const FeatureLock: React.FC<FeatureLockProps> = ({
  feature,
  requiredPlan = 'PRO',
  compact = false,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded text-xs font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          <Lock size={12} />
          <span>{requiredPlan}</span>
        </button>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType="feature"
          feature={feature}
          message={`This feature requires a ${requiredPlan} plan`}
        />
      </>
    );
  }

  return (
    <>
      <div className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
        <Lock size={16} className="text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm text-slate-700 dark:text-slate-300">
          Requires {requiredPlan} Plan
        </span>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="ml-2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded text-xs font-semibold transition-all"
        >
          Upgrade
        </button>
      </div>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="feature"
        feature={feature}
        message={`This feature requires a ${requiredPlan} plan`}
      />
    </>
  );
};
