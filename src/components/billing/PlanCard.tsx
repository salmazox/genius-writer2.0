/**
 * Plan Card Component
 *
 * Displays subscription plan with features and pricing
 */

import React from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { SubscriptionPlan, SubscriptionTier, formatPriceWithCurrency } from '../../config/pricing';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  billingCycle: 'monthly' | 'yearly';
  onSelect?: () => void;
  isPopular?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan = false,
  billingCycle,
  onSelect,
  isPopular = false
}) => {
  const { currency } = useThemeLanguage();

  const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearlyMonthly;
  const totalYearly = plan.price.yearly;
  const isFree = plan.id === SubscriptionTier.FREE;

  const monthlyEquivalent = billingCycle === 'yearly' ?
    ` (${formatPriceWithCurrency(totalYearly, currency as 'EUR' | 'USD')}/year)` : '';

  return (
    <div className={`relative bg-white dark:bg-slate-900 rounded-2xl border-2 p-6 transition-all duration-300 ${
      isCurrentPlan
        ? 'border-indigo-600 shadow-lg shadow-indigo-500/20'
        : isPopular
        ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105'
        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
    }`}>
      {/* Popular Badge */}
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-xs font-bold shadow-lg">
            <Star size={12} fill="currentColor" />
            Most Popular
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold shadow-lg">
            <Check size={12} />
            Current Plan
          </div>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {plan.tagline}
        </p>

        {/* Pricing */}
        <div className="mb-2">
          {isFree ? (
            <div className="text-4xl font-bold text-slate-900 dark:text-white">
              Free
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {formatPriceWithCurrency(price, currency as 'EUR' | 'USD').split(',')[0].split('.')[0]}
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  .{formatPriceWithCurrency(price, currency as 'EUR' | 'USD').split(',')[1] || '00'}
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                  /month
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Billed {monthlyEquivalent}
                </p>
              )}
            </>
          )}
        </div>

        {/* Savings Badge for Yearly */}
        {billingCycle === 'yearly' && !isFree && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
            <Zap size={12} />
            Save {Math.round(((plan.price.monthly * 12 - totalYearly) / (plan.price.monthly * 12)) * 100)}%
          </div>
        )}
      </div>

      {/* Features List */}
      <div className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className={`flex-shrink-0 mt-0.5 ${
              feature.included
                ? 'text-green-600 dark:text-green-400'
                : 'text-slate-300 dark:text-slate-700'
            }`}>
              <Check size={16} />
            </div>
            <span className={`text-sm ${
              feature.included
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-600 line-through'
            }`}>
              {feature.name}
              {feature.limit && feature.included && (
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                  ({feature.limit})
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {onSelect && (
        <button
          onClick={onSelect}
          disabled={isCurrentPlan}
          className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
            isCurrentPlan
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : isPopular
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : isFree ? 'Get Started' : `Upgrade to ${plan.name}`}
        </button>
      )}
    </div>
  );
};
