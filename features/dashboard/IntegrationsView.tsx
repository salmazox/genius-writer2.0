
import React from 'react';
import { Twitter, Linkedin, Instagram, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface IntegrationsViewProps {
    user: User;
    toggleLinkedAccount: (platform: keyof User['linkedAccounts']) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ user, toggleLinkedAccount }) => {
    const { showToast } = useToast();

    const handleConnectAccount = (platform: 'twitter' | 'linkedin' | 'instagram') => {
        const isConnected = user.linkedAccounts[platform];
        if (isConnected) {
            toggleLinkedAccount(platform);
            showToast(`Disconnected from ${platform}`, 'info');
        } else {
             showToast(`Connecting to ${platform}...`, 'info');
             setTimeout(() => {
                 toggleLinkedAccount(platform);
                 showToast(`Successfully linked ${platform}`, 'success');
             }, 1500);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Connected Accounts</h3>
                <p className="text-slate-500 text-sm mb-6">Connect your social media accounts to publish content directly.</p>
                
                <div className="space-y-4">
                    {/* Twitter */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-lg"><Twitter size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Twitter / X</h4>
                                <p className="text-xs text-slate-500">Post tweets and threads</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleConnectAccount('twitter')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${user.linkedAccounts.twitter ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                        >
                            {user.linkedAccounts.twitter ? 'Disconnect' : 'Connect'}
                        </button>
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-lg"><Linkedin size={24} /></div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">LinkedIn</h4>
                                <p className="text-xs text-slate-500">Post professional updates</p>
                            </div>
                        </div>
                        <button 
                             onClick={() => handleConnectAccount('linkedin')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${user.linkedAccounts.linkedin ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                        >
                            {user.linkedAccounts.linkedin ? 'Disconnect' : 'Connect'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
