
import React, { useRef } from 'react';
import { User, Upload } from 'lucide-react';
import { User as UserType } from '../../types';
import { validateImageFile } from '../../utils/security';
import { useToast } from '../../contexts/ToastContext';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';

interface ProfileViewProps {
    user: UserType;
    updateUser: (updates: Partial<UserType>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, updateUser }) => {
    const { showToast } = useToast();
    const { t } = useThemeLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validation = validateImageFile(file);
            if (!validation.valid) {
                showToast(validation.error || t('profile.uploadFailed'), "error");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ avatar: reader.result as string });
                showToast(t('profile.uploadSuccess'), "success");
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('profile.title')}</h2>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                         <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden flex items-center justify-center relative group">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="text-white" size={24} />
                            </div>
                         </div>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleAvatarUpload} />
                         <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">{t('profile.changePhoto')}</button>
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('profile.fullName')}</label>
                            <input
                                type="text"
                                value={user.name}
                                onChange={(e) => updateUser({ name: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('profile.emailAddress')}</label>
                            <input
                                type="email"
                                value={user.email}
                                onChange={(e) => updateUser({ email: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('profile.bioRole')}</label>
                            <textarea
                                value={user.bio || ''}
                                onChange={(e) => updateUser({ bio: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                                placeholder={t('profile.bioPlaceholder')}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={() => showToast(t('profile.saveSuccess'), 'success')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all">
                        {t('profile.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
};
