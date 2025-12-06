import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutTemplate, Plus, User, Search, Folder } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface MobileBottomNavProps {
    onOpenCommandPalette: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCommandPalette }) => {
    const { t } = useThemeLanguage();
    const navItemClass = ({ isActive }: { isActive: boolean }) =>
        `flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${
            isActive
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`;

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 pb-safe z-40 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <NavLink to="/dashboard?tab=library" className={navItemClass} end>
                <Home size={22} />
                <span className="text-[10px] font-medium">{t('ui.navigation.home')}</span>
            </NavLink>

            <button onClick={onOpenCommandPalette} className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                <Search size={22} />
                <span className="text-[10px] font-medium">{t('ui.navigation.search')}</span>
            </button>

            {/* Floating Action Button Effect */}
            <div className="relative -top-5">
                <NavLink
                    to="/dashboard?tab=library"
                    className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/40 transform transition-transform active:scale-95 border-4 border-slate-50 dark:border-slate-950"
                    aria-label={t('ui.navigation.createNew')}
                >
                    <Plus size={28} />
                </NavLink>
            </div>

            <NavLink to="/dashboard?tab=documents" className={navItemClass}>
                <Folder size={22} />
                <span className="text-[10px] font-medium">{t('ui.navigation.docs')}</span>
            </NavLink>

            <NavLink to="/user-dashboard" className={navItemClass}>
                <User size={22} />
                <span className="text-[10px] font-medium">{t('ui.navigation.profile')}</span>
            </NavLink>
        </div>
    );
};