
import React from 'react';
import { Twitter, Linkedin, Instagram, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';

interface IntegrationsViewProps {
    user: User;
    toggleLinkedAccount: (platform: keyof User['linkedAccounts']) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ user, toggleLinkedAccount }) => {
    const { showToast } = useToast();
    const { t } = useThemeLanguage();

    const handleConnectAccount = (platform: 'twitter' | 'linkedin' | 'instagram') => {
        const isConnected = user.linkedAccounts[platform];
        if (isConnected) {
            toggleLinkedAccount(platform);
            showToast(t('integrations.disconnected').replace('{platform}', platform), 'info');
        } else {
             showToast(t('integrations.connecting').replace('{platform}', platform), 'info');
             setTimeout(() => {
                 toggleLinkedAccount(platform);
                 showToast(t('integrations.linked').replace('{platform}', platform), 'success');
             }, 1500);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('integrations.title')}</h3>
                <p className="text-slate-500 text-sm mb-6">{t('integrations.subtitle')}</p>

                <div className="space-y-4">
                    {/* Twitter */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-lg"><Twitter size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t('integrations.twitter')}</h4>
                                <p className="text-xs text-slate-500">{t('integrations.twitterDesc')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleConnectAccount('twitter')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${user.linkedAccounts.twitter ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                        >
                            {user.linkedAccounts.twitter ? t('integrations.disconnect') : t('integrations.connect')}
                        </button>
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-lg"><Linkedin size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t('integrations.linkedin')}</h4>
                                <p className="text-xs text-slate-500">{t('integrations.linkedinDesc')}</p>
                            </div>
                        </div>
                        <button
                             onClick={() => handleConnectAccount('linkedin')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${user.linkedAccounts.linkedin ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                        >
                            {user.linkedAccounts.linkedin ? t('integrations.disconnect') : t('integrations.connect')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
