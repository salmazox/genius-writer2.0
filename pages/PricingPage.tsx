
import React, { useState } from 'react';
import { Check, X as XIcon, Star, Building, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const PricingPage: React.FC = () => {
  const { t } = useThemeLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Pricing Strategy (Euro - Premium Market)
  const prices = {
      pro: billingCycle === 'monthly' ? 29 : 24,
      agency: billingCycle === 'monthly' ? 99 : 79
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-20 transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">{t('pricing.label')}</h2>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl">
            {t('pricing.title')}
          </h1>
          <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">
            {t('pricing.subtitle')}
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center">
             <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center relative shadow-sm">
                 <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                     {t('pricing.monthly')}
                 </button>
                 <button 
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                     {t('pricing.yearly')}
                 </button>
             </div>
          </div>
        </div>

        {/* Pricing Cards Grid (4 Columns for Enterprise) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
          
          {/* Free Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t('pricing.starter')}</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">{t('pricing.starterDesc')}</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">€0</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('pricing.month')}</span>
            </div>
            <Link to="/dashboard" className="block w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              {t('nav.getStarted')}
            </Link>
            <div className="mt-8 space-y-4 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Includes</p>
              {[t('pricing.features.words2k'), t('pricing.features.modelFlash'), t('pricing.features.templatesBasic'), t('pricing.features.imagesNo')].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <Check className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </div>
          </div>

          {/* Pro Tier (Premium) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-2 border-indigo-600 p-8 flex flex-col relative transform xl:-translate-y-4 z-10">
            <div className="absolute top-0 right-0 left-0 bg-indigo-600 h-2"></div>
            <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                <Star size={12} className="fill-indigo-700" /> {t('pricing.popular')}
            </div>
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{t('pricing.pro')}</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">{t('pricing.proDesc')}</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">€{prices.pro}</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('pricing.month')}</span>
            </div>
            <Link to="/auth?plan=pro" className="block w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl text-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:scale-[1.02]">
              {t('pricing.startTrial')}
            </Link>
            <div className="mt-8 space-y-4 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Everything in Free, plus:</p>
              {[
                  t('pricing.features.words50k'), 
                  t('pricing.features.modelPro'), 
                  t('pricing.features.atsAccess'),
                  t('pricing.features.images50'),
                  t('pricing.features.templatesAll'),
                  t('pricing.features.brandVoices1')
                ].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-slate-700 dark:text-slate-200 font-medium">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full p-0.5">
                    <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  </div>
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </div>
          </div>

          {/* Agency Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t('pricing.agency')}</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">{t('pricing.agencyDesc')}</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">€{prices.agency}</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t('pricing.month')}</span>
            </div>
             <Link to="/contact" className="block w-full py-3 px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-center hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors">
              {t('pricing.contactSales')}
            </Link>
            <div className="mt-8 space-y-4 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Everything in Pro, plus:</p>
              {[
                  t('pricing.features.words200k'),
                  t('pricing.features.seats3'), 
                  t('pricing.features.images200'), 
                  t('pricing.features.brandVoicesUnlim'),
                  t('pricing.features.supportPrio'),
                  t('pricing.features.apiAccess')
                ].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <Check className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </div>
          </div>

           {/* Enterprise Tier (NEW) */}
           <div className="bg-slate-900 dark:bg-black rounded-3xl shadow-xl border border-slate-800 dark:border-slate-800 p-8 flex flex-col text-white">
            <div className="flex items-center gap-2 mb-2">
                 <Building size={20} className="text-indigo-400"/>
                 <h3 className="text-xl font-semibold text-white">{t('pricing.enterprise')}</h3>
            </div>
            <p className="text-slate-400 text-sm">{t('pricing.enterpriseDesc')}</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-white">Custom</span>
            </div>
             <Link to="/contact" className="block w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-center transition-colors">
              {t('pricing.contactSales')}
            </Link>
            <div className="mt-8 space-y-4 flex-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ultimate Power</p>
              {[
                  t('pricing.features.wordsUnlim'),
                  t('pricing.features.seatsUnlim'), 
                  t('pricing.features.imagesUnlim'), 
                  t('pricing.features.sso'),
                  t('pricing.features.supportDed'),
                ].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-slate-300">
                  <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span className="text-sm">{feat}</span>
                </li>
              ))}
            </div>
          </div>

        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pricing.compare.title')}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-4 pl-8 font-medium text-slate-500 min-w-[200px]">{t('pricing.compare.feature')}</th>
                            <th className="p-4 font-bold text-slate-900 dark:text-white min-w-[150px]">{t('pricing.compare.free')}</th>
                            <th className="p-4 font-bold text-indigo-600 dark:text-indigo-400 min-w-[150px]">{t('pricing.compare.pro')}</th>
                            <th className="p-4 font-bold text-slate-900 dark:text-white min-w-[150px]">{t('pricing.compare.agency')}</th>
                            <th className="p-4 font-bold text-slate-900 dark:text-white min-w-[150px]">{t('pricing.compare.enterprise')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                            <td className="p-4 pl-8 font-medium text-slate-700 dark:text-slate-300">Word Limit (Monthly)</td>
                            <td className="p-4 text-slate-500">2,000</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">50,000</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">200,000</td>
                            <td className="p-4 text-indigo-600 dark:text-indigo-400 font-bold">Unlimited</td>
                        </tr>
                        <tr>
                            <td className="p-4 pl-8 font-medium text-slate-700 dark:text-slate-300">AI Model</td>
                            <td className="p-4 text-slate-500">Gemini Flash</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">Gemini Pro</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">Gemini Pro</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">Gemini Pro/Ultra</td>
                        </tr>
                        <tr>
                            <td className="p-4 pl-8 font-medium text-slate-700 dark:text-slate-300">Image Generation</td>
                            <td className="p-4 text-slate-500"><XIcon size={16} /></td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">50 / mo</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">200 / mo</td>
                            <td className="p-4 text-indigo-600 dark:text-indigo-400 font-bold">Unlimited</td>
                        </tr>
                        <tr>
                            <td className="p-4 pl-8 font-medium text-slate-700 dark:text-slate-300">CV ATS Analysis</td>
                            <td className="p-4 text-slate-500"><XIcon size={16} /></td>
                            <td className="p-4 text-green-500"><Check size={16} /></td>
                            <td className="p-4 text-green-500"><Check size={16} /></td>
                            <td className="p-4 text-green-500"><Check size={16} /></td>
                        </tr>
                        <tr>
                            <td className="p-4 pl-8 font-medium text-slate-700 dark:text-slate-300">User Seats</td>
                            <td className="p-4 text-slate-500">1</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">1</td>
                            <td className="p-4 text-slate-900 dark:text-white font-medium">3</td>
                            <td className="p-4 text-indigo-600 dark:text-indigo-400 font-bold">Custom</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
