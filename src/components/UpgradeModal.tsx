import React from 'react';
import { X, Zap, Crown, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType?: 'aiGenerations' | 'documents' | 'storage' | 'feature';
  feature?: string;
  currentPlan?: string;
  message?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  limitType = 'aiGenerations',
  feature,
  currentPlan = 'FREE',
  message,
}) => {
  if (!isOpen) return null;

  const getLimitInfo = () => {
    switch (limitType) {
      case 'aiGenerations':
        return {
          icon: <Zap className="text-yellow-500" size={48} />,
          title: 'AI Generation Limit Reached',
          description: message || 'You\'ve used all your AI generations for this month.',
          benefits: [
            'PRO: 100 AI generations/month',
            'AGENCY: 500 AI generations/month',
            'ENTERPRISE: Unlimited generations',
          ],
        };
      case 'documents':
        return {
          icon: <Sparkles className="text-blue-500" size={48} />,
          title: 'Document Limit Reached',
          description: message || 'You\'ve reached your monthly document creation limit.',
          benefits: [
            'PRO: 50 documents/month',
            'AGENCY: 200 documents/month',
            'ENTERPRISE: Unlimited documents',
          ],
        };
      case 'storage':
        return {
          icon: <Crown className="text-purple-500" size={48} />,
          title: 'Storage Limit Reached',
          description: message || 'You\'ve used all your available storage.',
          benefits: [
            'PRO: 5 GB storage',
            'AGENCY: 50 GB storage',
            'ENTERPRISE: 500 GB storage',
          ],
        };
      case 'feature':
        return {
          icon: <Crown className="text-purple-500" size={48} />,
          title: `${feature || 'Premium Feature'} Not Available`,
          description: message || `This feature is not available on your ${currentPlan} plan.`,
          benefits: [
            'Access to all premium features',
            'Priority support',
            'Advanced analytics',
          ],
        };
      default:
        return {
          icon: <Zap className="text-indigo-500" size={48} />,
          title: 'Upgrade Required',
          description: message || 'Upgrade your plan to continue.',
          benefits: [],
        };
    }
  };

  const info = getLimitInfo();

  const plans = [
    {
      name: 'PRO',
      price: '€39',
      period: '/month',
      features: [
        '100 AI generations/month',
        '50 documents/month',
        '5 GB storage',
        'All export formats',
        '3 brand voices',
      ],
      popular: true,
    },
    {
      name: 'AGENCY',
      price: '€129',
      period: '/month',
      features: [
        '500 AI generations/month',
        '200 documents/month',
        '50 GB storage',
        'Team collaboration',
        '10 brand voices',
        'Priority support',
      ],
      popular: false,
    },
    {
      name: 'ENTERPRISE',
      price: 'Custom',
      period: '',
      features: [
        'Unlimited AI generations',
        'Unlimited documents',
        '500 GB storage',
        'API access',
        'Dedicated support',
        'Custom integrations',
      ],
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {info.icon}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {info.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {info.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Benefits */}
        {info.benefits.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Upgrade to unlock:
            </h3>
            <ul className="space-y-1">
              {info.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-slate-700 dark:text-slate-300 flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Plans */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
            Choose Your Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                  plan.popular
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {plan.name}
                  </h4>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {plan.price}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-sm text-slate-600 dark:text-slate-400 flex items-start"
                    >
                      <span className="mr-2 text-green-500 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/pricing"
                  className={`block w-full text-center py-2.5 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {plan.name === 'ENTERPRISE' ? 'Contact Sales' : 'Upgrade Now'}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              All plans include a 14-day money-back guarantee
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
