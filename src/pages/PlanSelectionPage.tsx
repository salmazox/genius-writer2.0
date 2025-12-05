import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { SubscriptionTier, getAllPlans, getPlan } from '../config/pricing';
import { PlanCard } from '../components/billing/PlanCard';

export const PlanSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const plans = getAllPlans();

  const handleContinue = async () => {
    if (selectedPlan === SubscriptionTier.FREE) {
      // Continue to dashboard with free plan
      navigate('/dashboard');
    } else {
      // Store selected plan for checkout
      sessionStorage.setItem('selectedPlan', JSON.stringify({ plan: selectedPlan, billingCycle }));
      navigate('/dashboard?checkout=pending');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
            <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Step 2 of 2
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start free and upgrade anytime. No credit card required for the free plan.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.id ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div
                className={`h-full rounded-2xl border-2 transition-all ${
                  selectedPlan === plan.id
                    ? 'border-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl h-full flex flex-col">
                  {/* Badge */}
                  {plan.badge && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.price.monthly === 0 ? (
                      <div className="text-4xl font-bold text-slate-900 dark:text-white">
                        Free
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-slate-900 dark:text-white">
                            €{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearlyMonthly}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">/month</span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Billed €{plan.price.yearly} annually
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 flex-grow">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check
                          className={`flex-shrink-0 mt-0.5 ${
                            feature.included
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                          size={18}
                        />
                        <span
                          className={`text-sm ${
                            feature.included
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-600 line-through'
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Selected Indicator */}
                  {selectedPlan === plan.id && (
                    <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg">
                      <Check size={18} />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleSkip}
            className="px-8 py-3 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            Skip for Now
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 font-bold flex items-center gap-2"
          >
            {selectedPlan === SubscriptionTier.FREE ? 'Start with Free' : `Continue with ${getPlan(selectedPlan).name}`}
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span>Upgrade anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionPage;
