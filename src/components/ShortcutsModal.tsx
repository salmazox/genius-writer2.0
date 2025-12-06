import React from 'react';
import { Modal } from './ui/Modal';
import { Keyboard } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShortcutRow: React.FC<{ keys: string[], action: string }> = ({ keys, action }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action}</span>
        <div className="flex gap-1">
            {keys.map((k, i) => (
                <kbd key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {k}
                </kbd>
            ))}
        </div>
    </div>
);

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useThemeLanguage();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('ui.shortcuts.title')} size="sm">
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                    <Keyboard size={20} />
                    <span className="font-bold text-sm">{t('ui.shortcuts.productivityBoosters')}</span>
                </div>

                <div className="space-y-1">
                    <ShortcutRow keys={['Ctrl', 'S']} action={t('ui.shortcuts.saveDocument')} />
                    <ShortcutRow keys={['Ctrl', '/']} action={t('ui.shortcuts.showShortcuts')} />
                    <ShortcutRow keys={['Ctrl', 'Z']} action={t('ui.shortcuts.undo')} />
                    <ShortcutRow keys={['Ctrl', 'Shift', 'Z']} action={t('ui.shortcuts.redo')} />
                    <ShortcutRow keys={['Ctrl', 'B']} action={t('ui.shortcuts.boldText')} />
                    <ShortcutRow keys={['Ctrl', 'I']} action={t('ui.shortcuts.italicText')} />
                </div>

                <p className="text-xs text-slate-400 mt-4 text-center">
                    {t('ui.shortcuts.macOsNote')} <kbd className="font-bold">{t('ui.shortcuts.cmd')}</kbd> {t('ui.shortcuts.insteadOf')} <kbd className="font-bold">{t('ui.shortcuts.ctrl')}</kbd>.
                </p>
            </div>
        </Modal>
    );
};