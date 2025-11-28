
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const NotFoundPage: React.FC = () => {
  const { t } = useThemeLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertOctagon size={48} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('errors.notFoundTitle')}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {t('errors.notFoundDesc')}
        </p>
        <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
        >
            {t('errors.goHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
