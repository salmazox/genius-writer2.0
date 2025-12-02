import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

export const useCopyToClipboard = () => {
  const { showToast } = useToast();
  const { t } = useThemeLanguage();

  const copyToClipboard = useCallback((text: string, message?: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      showToast(message || t('dashboard.actions.copied'), 'info');
    }).catch(() => {
      showToast(t('dashboard.toasts.error'), 'error');
    });
  }, [showToast, t]);

  return copyToClipboard;
};