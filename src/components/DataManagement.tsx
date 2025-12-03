import React, { useState } from 'react';
import { Download, Trash2, Shield, AlertTriangle, FileText, Check } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Button } from './ui/Button';
import { documentService } from '../services/documentService';

/**
 * DataManagement Component
 * GDPR/DSGVO Compliance: Allows users to exercise their data rights
 * - Right to Access (Art. 15 DSGVO)
 * - Right to Data Portability (Art. 20 DSGVO)
 * - Right to Erasure (Art. 17 DSGVO)
 */

export const DataManagement: React.FC = () => {
  const { user, logout } = useUser();
  const { showToast } = useToast();
  const { t, language } = useThemeLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const translations = {
    de: {
      title: 'Datenschutz & Datenmanagement',
      subtitle: 'Verwalten Sie Ihre persönlichen Daten gemäß DSGVO',
      dataOverview: 'Datenübersicht',
      dataStored: 'Gespeicherte Daten',
      accountInfo: 'Konto-Informationen',
      email: 'E-Mail',
      plan: 'Abo-Plan',
      created: 'Erstellt am',
      documents: 'Dokumente',
      docsCount: 'Gespeicherte Dokumente',
      usage: 'Nutzungsstatistik',
      wordsUsed: 'Wörter verwendet',
      imagesUsed: 'Bilder generiert',
      rights: 'Ihre Rechte nach DSGVO',
      rightToAccess: 'Recht auf Auskunft (Art. 15 DSGVO)',
      rightToAccessDesc: 'Sie haben das Recht, eine Kopie aller Ihrer gespeicherten Daten anzufordern.',
      rightToPortability: 'Recht auf Datenübertragbarkeit (Art. 20 DSGVO)',
      rightToPortabilityDesc: 'Sie können Ihre Daten in einem strukturierten, maschinenlesbaren Format exportieren.',
      rightToErasure: 'Recht auf Löschung (Art. 17 DSGVO)',
      rightToErasureDesc: 'Sie können die Löschung Ihres Kontos und aller persönlichen Daten beantragen.',
      exportData: 'Daten exportieren',
      exportDesc: 'Laden Sie alle Ihre Daten als JSON-Datei herunter',
      exportButton: 'Daten als JSON exportieren',
      exporting: 'Exportiere...',
      deleteAccount: 'Konto löschen',
      deleteDesc: 'Löschen Sie Ihr Konto und alle damit verbundenen Daten dauerhaft',
      deleteButton: 'Konto dauerhaft löschen',
      deleteWarningTitle: 'Warnung: Unwiderrufliche Löschung',
      deleteWarning: 'Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Dokumente, Einstellungen und persönlichen Daten werden dauerhaft gelöscht.',
      typeToConfirm: 'Geben Sie "LÖSCHEN" ein, um zu bestätigen',
      confirmDelete: 'Löschung bestätigen',
      cancel: 'Abbrechen',
      deleting: 'Lösche...',
      exportSuccess: 'Ihre Daten wurden erfolgreich exportiert!',
      deleteSuccess: 'Ihr Konto wurde gelöscht. Auf Wiedersehen!',
      deleteTypeMismatch: 'Bitte geben Sie "LÖSCHEN" ein, um fortzufahren.',
    },
    en: {
      title: 'Privacy & Data Management',
      subtitle: 'Manage your personal data according to GDPR',
      dataOverview: 'Data Overview',
      dataStored: 'Stored Data',
      accountInfo: 'Account Information',
      email: 'Email',
      plan: 'Subscription Plan',
      created: 'Created on',
      documents: 'Documents',
      docsCount: 'Saved Documents',
      usage: 'Usage Statistics',
      wordsUsed: 'Words Used',
      imagesUsed: 'Images Generated',
      rights: 'Your Rights under GDPR',
      rightToAccess: 'Right to Access (Art. 15 GDPR)',
      rightToAccessDesc: 'You have the right to request a copy of all your stored data.',
      rightToPortability: 'Right to Data Portability (Art. 20 GDPR)',
      rightToPortabilityDesc: 'You can export your data in a structured, machine-readable format.',
      rightToErasure: 'Right to Erasure (Art. 17 GDPR)',
      rightToErasureDesc: 'You can request deletion of your account and all personal data.',
      exportData: 'Export Data',
      exportDesc: 'Download all your data as a JSON file',
      exportButton: 'Export Data as JSON',
      exporting: 'Exporting...',
      deleteAccount: 'Delete Account',
      deleteDesc: 'Permanently delete your account and all associated data',
      deleteButton: 'Permanently Delete Account',
      deleteWarningTitle: 'Warning: Irreversible Deletion',
      deleteWarning: 'This action cannot be undone. All your documents, settings, and personal data will be permanently deleted.',
      typeToConfirm: 'Type "DELETE" to confirm',
      confirmDelete: 'Confirm Deletion',
      cancel: 'Cancel',
      deleting: 'Deleting...',
      exportSuccess: 'Your data has been successfully exported!',
      deleteSuccess: 'Your account has been deleted. Goodbye!',
      deleteTypeMismatch: 'Please type "DELETE" to proceed.',
    },
  };

  const text = translations[language];

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Get all documents
      const documents = documentService.getAll();

      // Get usage data
      const usageData = localStorage.getItem('gw_usage_tracker');
      const brandVoices = localStorage.getItem('brand_voices');

      // Compile all user data
      const userData = {
        account: {
          email: user.email,
          name: user.name,
          plan: user.plan,
          createdAt: new Date().toISOString(), // Mock, would come from backend
        },
        documents: documents,
        usage: usageData ? JSON.parse(usageData) : null,
        brandVoices: brandVoices ? JSON.parse(brandVoices) : [],
        exportDate: new Date().toISOString(),
        exportFormat: 'GDPR Data Export (JSON)',
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `genius-writer-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(text.exportSuccess, 'success');
    } catch (error) {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = language === 'de' ? 'LÖSCHEN' : 'DELETE';

    if (deleteConfirmText !== confirmText) {
      showToast(text.deleteTypeMismatch, 'error');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all local data
      localStorage.clear();
      sessionStorage.clear();

      // Clear IndexedDB if used
      if ('indexedDB' in window) {
        const dbs = await window.indexedDB.databases?.();
        dbs?.forEach(db => db.name && window.indexedDB.deleteDatabase(db.name));
      }

      showToast(text.deleteSuccess, 'success');

      // Logout and redirect
      setTimeout(() => {
        logout();
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      showToast('Deletion failed. Please contact support.', 'error');
      setIsDeleting(false);
    }
  };

  const documentCount = documentService.getAll().length;
  const usageDataStr = localStorage.getItem('gw_usage_tracker');
  const usageData = usageDataStr ? JSON.parse(usageDataStr) : { wordsUsed: 0, imagesUsed: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="text-indigo-600" /> {text.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{text.subtitle}</p>
      </div>

      {/* Data Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{text.dataOverview}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              {text.accountInfo}
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">{text.email}:</span> {user.email}</div>
              <div><span className="font-semibold">{text.plan}:</span> {user.plan}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              {text.usage}
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">{text.wordsUsed}:</span> {usageData.wordsUsed?.toLocaleString() || 0}</div>
              <div><span className="font-semibold">{text.imagesUsed}:</span> {usageData.imagesUsed || 0}</div>
              <div><span className="font-semibold">{text.docsCount}:</span> {documentCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* GDPR Rights */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{text.rights}</h3>

        <div className="space-y-4">
          {/* Right to Access */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-slate-900 dark:text-white">{text.rightToAccess}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{text.rightToAccessDesc}</p>
            </div>
          </div>

          {/* Right to Data Portability */}
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Download className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-slate-900 dark:text-white">{text.rightToPortability}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{text.rightToPortabilityDesc}</p>
              <Button
                onClick={handleExportData}
                isLoading={isExporting}
                icon={Download}
                variant="secondary"
                size="sm"
                className="mt-3"
              >
                {isExporting ? text.exporting : text.exportButton}
              </Button>
            </div>
          </div>

          {/* Right to Erasure */}
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-slate-900 dark:text-white">{text.rightToErasure}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{text.rightToErasureDesc}</p>
              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  icon={AlertTriangle}
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  {text.deleteButton}
                </Button>
              ) : (
                <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-red-600">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-red-600">{text.deleteWarningTitle}</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{text.deleteWarning}</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={text.typeToConfirm}
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDeleteAccount}
                      isLoading={isDeleting}
                      disabled={deleteConfirmText !== (language === 'de' ? 'LÖSCHEN' : 'DELETE')}
                      icon={Trash2}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? text.deleting : text.confirmDelete}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      {text.cancel}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
