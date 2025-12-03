import React, { useState } from 'react';
import { Check, X as XIcon, Star, Building, ShieldCheck, Zap, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const PricingPage: React.FC = () => {
  const { t, currency } = useThemeLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Updated Pricing Strategy with Dynamic Currency
  const prices = {
      pro: {
          EUR: billingCycle === 'monthly' ? 39 : 32,
          USD: billingCycle === 'monthly' ? 45 : 36,
      },
      agency: {
          EUR: billingCycle === 'monthly' ? 129 : 109,
          USD: billingCycle === 'monthly' ? 149 : 125,
      }
  };

  const symbol = currency === 'EUR' ? '€' : '$';
  const currentProPrice = prices.pro[currency];
  const currentAgencyPrice = prices.agency[currency];

  const FeatureItem = ({ text, included = true }: { text: string; included?: boolean }) => (
      <li className={`flex items-start gap-3 text-sm ${included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600 line-through decoration-slate-400/50'}`}>
          <div className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 ${included ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              {included ? <Check size={12} strokeWidth={3} /> : <XIcon size={12} strokeWidth={3} />}
          </div>
          <span className="leading-5">{text}</span>
      </li>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[100px]"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold mb-6 animate-in fade-in zoom-in duration-500">
             <Star size={12} className="fill-indigo-600 dark:fill-indigo-300"/>
             <span>Flexible Plans for Everyone</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            {t('pricing.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('pricing.subtitle')}
          </p>
          
          {/* Custom Billing Toggle */}
          <div className="mt-10 flex justify-center items-center gap-4 select-none">
             <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{t('pricing.monthly')}</span>
             <button 
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-slate-900 cursor-pointer"
             >
                 <span className={`absolute top-1 left-1 bg-white dark:bg-slate-300 shadow-md w-6 h-6 rounded-full transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}></span>
             </button>
             <span className={`text-sm font-bold flex items-center gap-2 transition-colors ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                 {t('pricing.yearly')}
                 <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-extrabold">Save ~20%</span>
             </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-24 items-start">
          
          {/* Free Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full group">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('pricing.starter')}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-h-[40px]">{t('pricing.starterDesc')}</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{symbol}0</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('pricing.month')}</span>
            </div>
            <Link to="/dashboard" className="block w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mb-8">
              {t('nav.getStarted')}
            </Link>
            <div className="space-y-4 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Core Features</p>
              <ul className="space-y-3">
                <FeatureItem text={t('pricing.features.words2k')} />
                <FeatureItem text={t('pricing.features.modelFlash')} />
                <FeatureItem text={t('pricing.features.templatesBasic')} />
                <FeatureItem text="1 Project" />
                <FeatureItem text="Basic SEO analysis" />
                <FeatureItem text={t('pricing.features.imagesNo')} included={false} />
                <FeatureItem text="Brand Voice" included={false} />
              </ul>
            </div>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-indigo-600 dark:border-indigo-500 shadow-2xl shadow-indigo-500/20 transform xl:-translate-y-4 flex flex-col h-full z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-lg">
                <Star size={12} className="fill-white" /> {t('pricing.popular')}
            </div>
            <div className="mb-6">
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2">{t('pricing.pro')}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-h-[40px]">{t('pricing.proDesc')}</p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{symbol}{currentProPrice}</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('pricing.month')}</span>
              </div>
              {billingCycle === 'yearly' && <p className="text-xs text-green-600 font-medium mt-1">Billed {symbol}{currentProPrice * 12} yearly</p>}
            </div>
            <Link to="/auth?plan=pro" className="block w-full py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-xl text-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:scale-[1.02] mb-8">
              {t('pricing.startTrial')}
            </Link>
            <div className="space-y-4 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Everything in Free, plus:</p>
              <ul className="space-y-3">
                <FeatureItem text={t('pricing.features.words50k')} />
                <FeatureItem text={t('pricing.features.modelPro')} />
                <FeatureItem text="Smart Editor with full SEO analysis" />
                <FeatureItem text={t('pricing.features.atsAccess')} />
                <FeatureItem text="Plagiarism detection & readability" />
                <FeatureItem text={t('pricing.features.images50')} />
                <FeatureItem text={t('pricing.features.templatesAll')} />
                <FeatureItem text="1 Custom Brand Voice" />
              </ul>
            </div>
          </div>

          {/* Agency Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('pricing.agency')}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-h-[40px]">{t('pricing.agencyDesc')}</p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{symbol}{currentAgencyPrice}</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('pricing.month')}</span>
              </div>
              {billingCycle === 'yearly' && <p className="text-xs text-green-600 font-medium mt-1">Billed {symbol}{currentAgencyPrice * 12} yearly</p>}
            </div>
             <Link to="/contact" className="block w-full py-3 px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-center hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors mb-8">
              {t('pricing.contactSales')}
            </Link>
            <div className="space-y-4 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Everything in Pro, plus:</p>
                <ul className="space-y-3">
                    <FeatureItem text={t('pricing.features.words200k')} />
                    <FeatureItem text="3 Team seats with collaboration" />
                    <FeatureItem text={t('pricing.features.images200')} />
                    <FeatureItem text="Unlimited Brand Voices" />
                    <FeatureItem text="Advanced analysis & reporting" />
                    <FeatureItem text={t('pricing.features.supportPrio')} />
                    <FeatureItem text={t('pricing.features.apiAccess')} />
                </ul>
            </div>
          </div>

           {/* Enterprise Tier */}
           <div className="bg-slate-900 dark:bg-black rounded-3xl p-8 border border-slate-800 dark:border-slate-800 shadow-xl flex flex-col h-full text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
            
            <div className="mb-6 relative z-10">
                 <div className="flex items-center gap-2 mb-2 text-indigo-400">
                     <Building size={20} />
                     <h3 className="text-lg font-bold text-white">{t('pricing.enterprise')}</h3>
                 </div>
                 <p className="text-slate-400 text-sm leading-relaxed min-h-[40px]">{t('pricing.enterpriseDesc')}</p>
            </div>
            <div className="mb-8 relative z-10">
              <span className="text-4xl font-extrabold text-white">Custom</span>
            </div>
             <Link to="/contact" className="relative z-10 block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-50 text-white font-bold rounded-xl text-center transition-colors mb-8 shadow-lg shadow-indigo-900/50">
              {t('pricing.contactSales')}
            </Link>
            <div className="space-y-4 flex-1 relative z-10">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Ultimate Power</p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <ShieldCheck size={16} className="mt-0.5 text-indigo-400 shrink-0" />
                        <span>{t('pricing.features.wordsUnlim')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                         <ShieldCheck size={16} className="mt-0.5 text-indigo-400 shrink-0" />
                        <span>{t('pricing.features.seatsUnlim')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                         <ShieldCheck size={16} className="mt-0.5 text-indigo-400 shrink-0" />
                        <span>{t('pricing.features.sso')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                         <ShieldCheck size={16} className="mt-0.5 text-indigo-400 shrink-0" />
                        <span>{t('pricing.features.supportDed')}</span>
                    </li>
                     <li className="flex items-start gap-3 text-sm text-slate-300">
                         <ShieldCheck size={16} className="mt-0.5 text-indigo-400 shrink-0" />
                        <span>Custom AI Model Tuning</span>
                    </li>
                </ul>
            </div>
          </div>
        </div>

        {/* Comparison Table Section */}
        <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('pricing.compare.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400">Detailed feature breakdown for all plans.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                                <th className="p-6 font-semibold text-slate-500 uppercase tracking-wider text-xs w-1/4 min-w-[200px]">{t('pricing.compare.feature')}</th>
                                <th className="p-6 font-bold text-slate-900 dark:text-white w-1/5 min-w-[140px] text-center">{t('pricing.compare.free')}</th>
                                <th className="p-6 font-bold text-indigo-600 dark:text-indigo-400 w-1/5 min-w-[140px] text-center">{t('pricing.compare.pro')}</th>
                                <th className="p-6 font-bold text-slate-900 dark:text-white w-1/5 min-w-[140px] text-center">{t('pricing.compare.agency')}</th>
                                <th className="p-6 font-bold text-slate-900 dark:text-white w-1/5 min-w-[140px] text-center">{t('pricing.compare.enterprise')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { name: 'Word Limit (Monthly)', free: '2,000', pro: '50,000', agency: '200,000', ent: 'Unlimited' },
                                { name: 'AI Model', free: 'Gemini Flash', pro: 'Gemini Pro + Flash', agency: 'Gemini Pro + Flash', ent: 'Custom / Ultra' },
                                { name: 'Smart Editor', free: true, pro: true, agency: true, ent: true },
                                { name: 'SEO & Readability', free: 'Basic', pro: 'Full', agency: 'Full + Reports', ent: 'Advanced' },
                                { name: 'ATS Optimization', free: false, pro: true, agency: true, ent: true },
                                { name: 'Plagiarism Detection', free: false, pro: true, agency: true, ent: true },
                                { name: 'Image Generation', free: false, pro: '50 / mo', agency: '200 / mo', ent: 'Unlimited' },
                                { name: 'Brand Voices', free: '0', pro: '1', agency: 'Unlimited', ent: 'Unlimited' },
                                { name: 'Team Seats', free: '1', pro: '1', agency: '3', ent: 'Unlimited' },
                                { name: 'Support', free: 'Community', pro: 'Standard', agency: 'Priority', ent: 'Dedicated' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-6 font-medium text-slate-900 dark:text-white">{row.name}</td>
                                    <td className="p-6 text-slate-600 dark:text-slate-400 text-center">
                                        {typeof row.free === 'boolean' ? (row.free ? <CheckCircle2 size={18} className="mx-auto text-green-500" /> : <XIcon size={18} className="mx-auto text-slate-300" />) : row.free}
                                    </td>
                                    <td className="p-6 text-slate-600 dark:text-slate-400 text-center font-medium text-indigo-600 dark:text-indigo-400">
                                        {typeof row.pro === 'boolean' ? (row.pro ? <CheckCircle2 size={18} className="mx-auto text-green-500" /> : <XIcon size={18} className="mx-auto text-slate-300" />) : row.pro}
                                    </td>
                                    <td className="p-6 text-slate-600 dark:text-slate-400 text-center">
                                        {typeof row.agency === 'boolean' ? (row.agency ? <CheckCircle2 size={18} className="mx-auto text-green-500" /> : <XIcon size={18} className="mx-auto text-slate-300" />) : row.agency}
                                    </td>
                                    <td className="p-6 text-slate-600 dark:text-slate-400 text-center">
                                        {typeof row.ent === 'boolean' ? (row.ent ? <CheckCircle2 size={18} className="mx-auto text-green-500" /> : <XIcon size={18} className="mx-auto text-slate-300" />) : row.ent}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ CTA */}
            <div className="text-center mt-20">
                <p className="text-slate-600 dark:text-slate-400 mb-4">Have more questions?</p>
                <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center justify-center gap-1">
                    <HelpCircle size={16} /> Visit our Help Center
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default PricingPage;