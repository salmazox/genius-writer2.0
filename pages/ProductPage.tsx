
import React from 'react';
import { Layers, Shield, Zap, Clock, Users, Briefcase, PenTool, Lock, Server, EyeOff, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const ProductPage: React.FC = () => {
  const { t } = useThemeLanguage();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      <div className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('product.title')}</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('product.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-24">
          {/* AI Power Section */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Zap size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('product.geminiTitle')}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('product.geminiDesc')}
              </p>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-xs font-mono text-slate-500 dark:text-slate-400">Prompt</div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">Write a witty tweet about coffee.</p>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">AI</div>
                        <p className="text-slate-900 dark:text-white text-sm font-medium">"Decaf is just brown sadness water. ☕️ Give me the high-octane bean juice or give me sleep! #MondayMotivation #CoffeeLover"</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Personas Section (New) */}
          <div className="py-10">
              <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">{t('product.personas.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-6">
                          <Briefcase size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('product.personas.jobSeekers')}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{t('product.personas.jobSeekersDesc')}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all">
                      <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-6">
                          <PenTool size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('product.personas.creators')}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{t('product.personas.creatorsDesc')}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all">
                      <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-6">
                          <Users size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('product.personas.agencies')}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{t('product.personas.agenciesDesc')}</p>
                  </div>
              </div>
          </div>

          {/* Templates Section */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Layers size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('product.templatesTitle')}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('product.templatesDesc')}
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 transform hover:-translate-y-1 transition-transform">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t('features.cv')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Optimized for ATS systems.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 transform hover:-translate-y-1 transition-transform translate-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t('features.blog')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">SEO-structured with H1/H2 tags.</p>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 transform hover:-translate-y-1 transition-transform">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t('features.translate')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Nuance preservation.</p>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 transform hover:-translate-y-1 transition-transform translate-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t('categories.Email')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Formal, casual, or urgent tones.</p>
                </div>
            </div>
          </div>

          {/* Security Section (New) */}
          <div className="bg-slate-900 dark:bg-black rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1">
                      <Shield size={48} className="text-green-400 mb-6" />
                      <h2 className="text-3xl font-bold mb-4">{t('product.security.title')}</h2>
                      <p className="text-slate-400 text-lg leading-relaxed mb-8">{t('product.security.desc')}</p>
                      <ul className="space-y-3">
                          <li className="flex items-center gap-3"><Check className="text-green-400" size={20}/> {t('product.security.feature1')}</li>
                          <li className="flex items-center gap-3"><Lock className="text-green-400" size={20}/> {t('product.security.feature2')}</li>
                          <li className="flex items-center gap-3"><EyeOff className="text-green-400" size={20}/> {t('product.security.feature3')}</li>
                      </ul>
                  </div>
                  <div className="flex-1 bg-slate-800/50 p-8 rounded-2xl border border-slate-700 w-full">
                      <div className="flex items-center gap-3 mb-4">
                          <Server className="text-indigo-400" size={24} />
                          <span className="font-mono text-sm text-indigo-300">Status: Secured</span>
                      </div>
                      <div className="space-y-3">
                          <div className="h-2 w-full bg-slate-700 rounded"></div>
                          <div className="h-2 w-3/4 bg-slate-700 rounded"></div>
                          <div className="h-2 w-1/2 bg-slate-700 rounded"></div>
                      </div>
                      <div className="mt-6 p-4 bg-green-900/20 border border-green-900/50 rounded flex items-center gap-2 text-green-400 text-sm">
                          <Lock size={16}/> End-to-End Encrypted
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
      
       <div className="bg-white dark:bg-slate-900 py-16 text-center border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t('product.ready')}</h2>
             <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
            >
              {t('hero.startFree')}
            </Link>
       </div>
    </div>
  );
};

export default ProductPage;
