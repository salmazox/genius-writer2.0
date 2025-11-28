
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const LegalPage: React.FC = () => {
  const { t } = useThemeLanguage();
  const location = useLocation();
  const isPrivacy = location.pathname === '/privacy';
  
  const title = isPrivacy ? t('legal.privacyTitle') : t('legal.termsTitle');

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-20 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">{t('legal.lastUpdated')}</p>
        
        <div className="prose dark:prose-invert prose-indigo max-w-none">
            {isPrivacy ? (
                <>
                    <p>Your privacy is important to us. It is AI Writer's policy to respect your privacy regarding any information we may collect from you across our website.</p>
                    <h3>1. Information We Collect</h3>
                    <p>We collect information fairly and lawfully, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
                    <h3>2. Use of Data</h3>
                    <p>We do not use your personal content to train our public AI models. Your data remains yours.</p>
                    <h3>3. Security</h3>
                    <p>We store data using enterprise-grade encryption protocols.</p>
                </>
            ) : (
                <>
                    <p>By accessing our website, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
                    <h3>1. Usage License</h3>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on AI Writer's website for personal, non-commercial transitory viewing only.</p>
                    <h3>2. Disclaimer</h3>
                    <p>The materials on AI Writer's website are provided on an 'as is' basis. AI Writer makes no warranties, expressed or implied.</p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
