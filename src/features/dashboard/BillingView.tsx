
import React, { useState } from 'react';
import { Download, CreditCard, CheckCircle2, Sparkles, FileText, HardDrive, Users } from 'lucide-react';
import { Invoice } from '../../types';
import { UsageCard } from '../../components/billing/UsageCard';
import { PlanCard } from '../../components/billing/PlanCard';
import { SubscriptionTier, getAllPlans, getPlan } from '../../config/pricing';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';

export const BillingView: React.FC = () => {
    const { t } = useThemeLanguage();
    const [showPlans, setShowPlans] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Mock current user data
    const [currentTier] = useState<SubscriptionTier>(SubscriptionTier.PROFESSIONAL);
    const currentPlan = getPlan(currentTier);
    const allPlans = getAllPlans();

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
        { id: 'INV-2023-001', date: 'Oct 24, 2023', amount: 29.00, status: t('billing.invoices.paid'), items: t('billing.invoices.proMonthly') },
        { id: 'INV-2023-002', date: 'Sep 24, 2023', amount: 29.00, status: t('billing.invoices.paid'), items: t('billing.invoices.proMonthly') },
        { id: 'INV-2023-003', date: 'Aug 24, 2023', amount: 29.00, status: t('billing.invoices.paid'), items: t('billing.invoices.proMonthly') },
    ];

    const handleUpgradeClick = () => {
        setShowPlans(true);
    };

    const handlePlanSelect = (tier: SubscriptionTier) => {
        console.log('Selected plan:', tier);
        // Here you would typically initiate the Stripe checkout or upgrade process
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
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
                        <p className="text-indigo-200 text-sm">{t('billing.nextBilling')} November 24, 2023</p>
                    </div>
                    <div className="flex gap-3">
                         <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors backdrop-blur-sm">
                            {t('billing.cancelPlan')}
                         </button>
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

             {/* Payment Method */}
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
                     <button className="text-sm text-indigo-600 font-medium hover:underline">{t('billing.payment.edit')}</button>
                 </div>
             </div>

             {/* Invoices */}
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" data-tour="invoices">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('billing.invoices.title')}</h3>
                 </div>
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {mockInvoices.map(invoice => (
                         <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                             <div className="flex flex-col">
                                 <span className="font-bold text-slate-900 dark:text-white text-sm">{invoice.items}</span>
                                 <span className="text-xs text-slate-500">{invoice.date}</span>
                             </div>
                             <div className="flex items-center gap-4">
                                 <span className="font-bold text-slate-900 dark:text-white">€{invoice.amount.toFixed(2)}</span>
                                 <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-bold">{invoice.status}</span>
                                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={18} /></button>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
};
