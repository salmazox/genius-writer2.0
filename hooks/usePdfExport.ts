import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

declare global {
  interface Window {
    html2pdf: any;
  }
}

interface PdfOptions {
  filename: string;
  margin?: number;
  scale?: number;
  orientation?: 'portrait' | 'landscape';
}

export const usePdfExport = () => {
  const { showToast } = useToast();
  const { t } = useThemeLanguage();

  const exportToPdf = useCallback((element: HTMLElement | null, options: PdfOptions) => {
    if (!element) {
      showToast(t('dashboard.toasts.error'), 'error');
      return;
    }

    if (!window.html2pdf) {
      showToast("PDF Library not loaded.", "error");
      return;
    }

    showToast("Generating PDF...", "info"); // Ideally add to translations as dashboard.messages.generatingPdf

    const opt = {
      margin: options.margin ?? 0.5,
      filename: options.filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: options.scale ?? 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: options.orientation ?? 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save();
  }, [showToast, t]);

  return exportToPdf;
};