
import React, { useState, useEffect } from 'react';
import { Download, CreditCard, CheckCircle2, Sparkles, FileText, HardDrive, Users, AlertCircle } from 'lucide-react';
import { Invoice } from '../../types';
import { UsageCard } from '../../components/billing/UsageCard';
import { PlanCard } from '../../components/billing/PlanCard';
import { SubscriptionTier, getAllPlans, getPlan, mapBackendPlanToTier, mapTierToBackendPlan } from '../../config/pricing';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';
import { useUser } from '../../contexts/UserContext';
import * as billingAPI from '../../services/billingAPI';

export const BillingView: React.FC = () => {
    const { t } = useThemeLanguage();
    const { user } = useUser();
    const [showPlans, setShowPlans] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canceling, setCanceling] = useState(false);

    // Determine current tier from subscription or user data
    // Convert backend plan names (PRO, AGENCY) to frontend enum (starter, professional)
    const backendPlan = subscription?.plan || user?.plan;
    const currentTier = mapBackendPlanToTier(backendPlan);
    const currentPlan = getPlan(currentTier);
    const allPlans = getAllPlans();

    // Load subscription data
    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await billingAPI.getSubscription();
            setSubscription(data.subscription);
        } catch (err) {
            console.error('Failed to load subscription:', err);
            setError('Failed to load subscription details');
        } finally {
            setLoading(false);
        }
    };

    // Mock usage data
    const usageMetrics = [
        {
            label: t('billing.usage.aiGenerations'),
            current: 423,
            limit: currentPlan.limits.aiGenerations,
            unit: t('billing.usage.generations'),
            icon: <Sparkles size={16} />
        },
        {
            label: t('billing.usage.documents'),
            current: 156,
            limit: currentPlan.limits.documentsPerMonth,
            unit: t('billing.usage.documents').toLowerCase(),
            icon: <FileText size={16} />
        },
        {
            label: t('billing.usage.storage'),
            current: 32,
            limit: currentPlan.limits.storageGB,
            unit: t('billing.usage.gb'),
            icon: <HardDrive size={16} />
        },
        {
            label: t('billing.usage.teamMembers'),
            current: 3,
            limit: currentPlan.limits.collaborators,
            unit: t('billing.usage.members'),
            icon: <Users size={16} />
        }
    ];

    const mockInvoices: Invoice[] = [
        { id: 'INV-2023-001', date: 'Oct 24, 2023', amount: 29.00, status: 'Paid', items: 'Pro Plan - Monthly' },
        { id: 'INV-2023-002', date: 'Sep 24, 2023', amount: 29.00, status: 'Paid', items: 'Pro Plan - Monthly' },
        { id: 'INV-2023-003', date: 'Aug 24, 2023', amount: 29.00, status: 'Paid', items: 'Pro Plan - Monthly' },
    ];

    const handleUpgradeClick = () => {
        setShowPlans(true);
    };

    const handlePlanSelect = async (tier: SubscriptionTier) => {
        try {
            setError(null);

            // Can't create checkout for free plan
            if (tier === SubscriptionTier.FREE) {
                setError('Cannot upgrade to free plan');
                return;
            }

            // Convert frontend tier to backend plan name
            const backendPlanName = mapTierToBackendPlan(tier);

            // Type guard to ensure only paid plans
            if (backendPlanName === 'FREE') {
                setError('Cannot upgrade to free plan');
                return;
            }

            const result = await billingAPI.createCheckoutSession({
                plan: backendPlanName,
                billingPeriod: billingCycle
            });

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.url) {
                // Redirect to Stripe checkout
                window.location.href = result.url;
            }
        } catch (err) {
            console.error('Failed to initiate checkout:', err);
            setError('Failed to start checkout process');
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm(t('billing.confirmCancel') || 'Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
            return;
        }

        try {
            setCanceling(true);
            setError(null);
            const result = await billingAPI.cancelSubscription();

            if (result.error) {
                setError(result.error);
                return;
            }

            // Reload subscription data
            await loadSubscription();
            alert(result.message || 'Subscription cancelled successfully');
        } catch (err) {
            console.error('Failed to cancel subscription:', err);
            setError('Failed to cancel subscription');
        } finally {
            setCanceling(false);
        }
    };

    const handleManagePayment = async () => {
        try {
            setError(null);

            // Check if user has an active subscription
            if (!subscription || !subscription.stripeCustomerId) {
                setError('You need an active subscription to manage payment methods. Please upgrade to a paid plan first.');
                return;
            }

            await billingAPI.openCustomerPortal();
        } catch (err) {
            console.error('Failed to open customer portal:', err);
            setError('Failed to open payment management portal');
        }
    };

    // Check if user has active paid subscription
    const hasActiveSubscription = subscription && subscription.stripeCustomerId && subscription.status === 'ACTIVE';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading subscription details...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
             {/* Error Message */}
             {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                </div>
             )}

             {/* Current Plan */}
             <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden" data-tour="current-plan">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold uppercase tracking-wider">{t('billing.currentPlan')}</div>
                             <span className="text-green-300 flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={12} /> {t('billing.active')}</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-1">{currentPlan.name}</h2>
                        <p className="text-indigo-200 text-sm">
                            {subscription?.stripeCurrentPeriodEnd
                                ? `${t('billing.nextBilling')} ${new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}`
                                : t('billing.nextBilling')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                         {subscription && subscription.status === 'ACTIVE' && (
                            <button
                                onClick={handleCancelSubscription}
                                disabled={canceling}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition-colors backdrop-blur-sm"
                            >
                                {canceling ? 'Canceling...' : t('billing.cancelPlan')}
                            </button>
                         )}
                         {currentTier !== SubscriptionTier.ENTERPRISE && (
                            <button
                                onClick={handleUpgradeClick}
                                className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-bold transition-colors shadow-lg"
                            >
                                {t('billing.upgradePlan')}
                            </button>
                         )}
                    </div>
                </div>
             </div>

             {/* Usage Card */}
             <div data-tour="usage-metrics">
                <UsageCard
                    tier={currentTier}
                    metrics={usageMetrics}
                    daysUntilReset={8}
                    onUpgrade={handleUpgradeClick}
                />
             </div>

             {/* Plan Selection (shown when user clicks upgrade) */}
             {showPlans && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6" data-tour="upgrade-section">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {t('billing.choosePlan')}
                            </h3>
                            <button
                                onClick={() => setShowPlans(false)}
                                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
                            >
                                {t('billing.hidePlans')}
                            </button>
                        </div>

                        {/* Billing Cycle Toggle */}
                        <div className="flex items-center justify-center gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    billingCycle === 'monthly'
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                {t('billing.monthly')}
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    billingCycle === 'yearly'
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                {t('billing.yearly')}
                                <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-bold">
                                    {t('billing.saveUpTo')}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Plan Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {allPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isCurrentPlan={plan.id === currentTier}
                                billingCycle={billingCycle}
                                onSelect={() => handlePlanSelect(plan.id)}
                                isPopular={plan.popular}
                            />
                        ))}
                    </div>
                </div>
             )}

             {/* Payment Method - Only show for active subscriptions */}
             {hasActiveSubscription && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('billing.payment.title')}</h3>
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                                <CreditCard size={20} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{t('billing.payment.visaEnding')}</p>
                                <p className="text-xs text-slate-500">{t('billing.payment.expires')}</p>
                            </div>
                        </div>
                        <button
                           onClick={handleManagePayment}
                           className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        >
                           {t('billing.payment.edit')}
                        </button>
                    </div>
                </div>
             )}

             {/* Get Started CTA for Free Users */}
             {!hasActiveSubscription && currentTier === SubscriptionTier.FREE && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Ready to unlock more features?
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Upgrade to a paid plan to access premium features, manage payment methods, and view invoices.
                            </p>
                        </div>
                        <button
                            onClick={handleUpgradeClick}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors whitespace-nowrap"
                        >
                            View Plans
                        </button>
                    </div>
                </div>
             )}

             {/* Invoices */}
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" data-tour="invoices">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('billing.invoices.title')}</h3>
                 </div>
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {mockInvoices.map(invoice => (
                         <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                             <div className="flex flex-col">
                                 <span className="font-bold text-slate-900 dark:text-white text-sm">{t('billing.invoices.proMonthly')}</span>
                                 <span className="text-xs text-slate-500">{invoice.date}</span>
                             </div>
                             <div className="flex items-center gap-4">
                                 <span className="font-bold text-slate-900 dark:text-white">€{invoice.amount.toFixed(2)}</span>
                                 <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-bold">{t('billing.invoices.paid')}</span>
                                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={18} /></button>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};
