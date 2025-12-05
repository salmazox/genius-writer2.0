import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE' | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  className?: string;
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  className = ''
}) => {
  const getBadgeConfig = () => {
    // Scheduled for cancellation
    if (status === 'ACTIVE' && cancelAtPeriodEnd && currentPeriodEnd) {
      const endDate = new Date(currentPeriodEnd);
      const daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      return {
        icon: <Clock size={14} />,
        text: `Cancels ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        subtext: daysRemaining > 0 ? `${daysRemaining} days left` : 'Ends today',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      };
    }

    switch (status) {
      case 'ACTIVE':
        return {
          icon: <CheckCircle2 size={14} />,
          text: 'Active',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800'
        };

      case 'TRIALING':
        const trialEndDate = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
        const trialDays = trialEndDate
          ? Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          icon: <Sparkles size={14} />,
          text: 'Trial',
          subtext: trialDays ? `${trialDays} days left` : null,
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-700 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };

      case 'PAST_DUE':
        return {
          icon: <AlertTriangle size={14} />,
          text: 'Payment Failed',
          subtext: 'Update payment method',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-700 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800'
        };

      case 'CANCELED':
        return {
          icon: <XCircle size={14} />,
          text: 'Expired',
          bgColor: 'bg-slate-100 dark:bg-slate-800',
          textColor: 'text-slate-700 dark:text-slate-400',
          borderColor: 'border-slate-200 dark:border-slate-700'
        };

      case 'INCOMPLETE':
        return {
          icon: <AlertTriangle size={14} />,
          text: 'Incomplete',
          subtext: 'Action required',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          textColor: 'text-orange-700 dark:text-orange-400',
          borderColor: 'border-orange-200 dark:border-orange-800'
        };

      default:
        return {
          icon: <CheckCircle2 size={14} />,
          text: 'Free Plan',
          bgColor: 'bg-slate-100 dark:bg-slate-800',
          textColor: 'text-slate-700 dark:text-slate-400',
          borderColor: 'border-slate-200 dark:border-slate-700'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div
      className={`inline-flex flex-col gap-0.5 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
        {config.icon}
        <span>{config.text}</span>
      </div>
      {config.subtext && (
        <span className="text-xs font-medium opacity-80">
          {config.subtext}
        </span>
      )}
    </div>
  );
};
