/**
 * Help Button Component
 *
 * Trigger button to open help panel
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useHelp } from '../../contexts/HelpContext';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';
import { Tooltip } from './Tooltip';

interface HelpButtonProps {
  articleId?: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  articleId,
  variant = 'icon',
  className = ''
}) => {
  const { openHelp } = useHelp();
  const { t } = useThemeLanguage();

  const handleClick = () => {
    openHelp(articleId);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg ${className}`}
      >
        <HelpCircle size={18} />
        <span>{t('ui.help.help')}</span>
      </button>
    );
  }

  return (
    <Tooltip content={t('ui.help.helpAndSupport')} placement="bottom">
      <button
        onClick={handleClick}
        className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
        aria-label={t('ui.help.openHelp')}
      >
        <HelpCircle size={20} />
      </button>
    </Tooltip>
  );
};
