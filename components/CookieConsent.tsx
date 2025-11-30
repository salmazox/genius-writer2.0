
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, Cookie } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Button } from './ui/Button';

export const CookieConsent: React.FC = () => {
  const { t } = useThemeLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Consent State
  const [consent, setConsent] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie_consent');
    if (!savedConsent) {
      setTimeout(() => setIsVisible(true), 1000);
    }

    // Event listener to re-open from footer
    const handleOpen = () => {
        setIsVisible(true);
        setShowDetails(true); // Auto expand when re-opened
    };
    window.addEventListener('openCookieSettings', handleOpen);
    return () => window.removeEventListener('openCookieSettings', handleOpen);
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = { necessary: true, analytics: true, marketing: true };
    saveConsent(fullConsent);
  };

  const handleRejectAll = () => {
    const minConsent = { necessary: true, analytics: false, marketing: false };
    saveConsent(minConsent);
  };

  const handleSaveSelection = () => {
    saveConsent(consent);
  };

  const saveConsent = (preferences: typeof consent) => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      preferences,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
    if (preferences.analytics) {
        console.log("Analytics cookies enabled");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[9999] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-5xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Main Banner Content */}
        <div className="p-6 md:flex md:items-start md:gap-6">
          <div className="hidden md:flex p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <Cookie size={32} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="md:hidden"><Cookie size={18} className="text-indigo-600"/></span> 
              {t('cookies.title')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('cookies.description')}
            </p>
            <div className="mb-4 flex gap-4 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                <Link to="/imprint" className="hover:underline">Imprint</Link>
            </div>

            {/* Expandable Details */}
            {showDetails && (
              <div className="mb-6 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-green-500"/>
                    <div>
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">{t('cookies.necessary')}</span>
                      <span className="text-xs text-slate-500">{t('cookies.necessaryDesc')}</span>
                    </div>
                  </div>
                  <input type="checkbox" checked disabled className="accent-indigo-600 w-4 h-4" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{t('cookies.analytics')}</span>
                    <span className="text-xs text-slate-500">{t('cookies.analyticsDesc')}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consent.analytics} 
                    onChange={(e) => setConsent({...consent, analytics: e.target.checked})}
                    className="accent-indigo-600 w-4 h-4 cursor-pointer" 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{t('cookies.marketing')}</span>
                    <span className="text-xs text-slate-500">{t('cookies.marketingDesc')}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consent.marketing} 
                    onChange={(e) => setConsent({...consent, marketing: e.target.checked})}
                    className="accent-indigo-600 w-4 h-4 cursor-pointer" 
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleAcceptAll} variant="primary" className="w-full sm:w-auto">
                {t('cookies.acceptAll')}
              </Button>
              <Button onClick={handleRejectAll} variant="ghost" className="w-full sm:w-auto">
                {t('cookies.rejectAll')}
              </Button>
              <div className="flex-1 sm:text-right mt-2 sm:mt-0">
                 {showDetails ? (
                    <div className="flex gap-2 justify-end">
                       <Button onClick={handleSaveSelection} variant="secondary" size="sm">
                          {t('cookies.save')}
                       </Button>
                    </div>
                 ) : (
                    <button 
                      onClick={() => setShowDetails(true)} 
                      className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 ml-auto"
                    >
                      {t('cookies.customize')} <ChevronDown size={14} />
                    </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};