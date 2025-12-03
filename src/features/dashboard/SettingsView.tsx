
import React, { useRef } from 'react';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { documentService } from '../../services/documentService';
import { useToast } from '../../contexts/ToastContext';
import { DataManagement } from '../../components/DataManagement';

export const SettingsView: React.FC = () => {
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = documentService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genius_writer_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Backup downloaded successfully", "success");
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                if (documentService.importData(json)) {
                    showToast("Data imported successfully! Reloading...", "success");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast("Invalid backup file", "error");
                }
            } catch (err) {
                showToast("Failed to parse backup file", "error");
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* GDPR Data Management */}
            <DataManagement />

            {/* Document Backup & Restore */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Document Backup & Restore</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Manage your local data. Since Genius Writer runs in your browser, your data is stored on this device.
                    Create backups to prevent data loss.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                                <Download size={20} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Export Backup</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Download a JSON file containing all your documents, folders, and settings.
                        </p>
                        <Button onClick={handleExport} variant="outline" className="w-full">
                            Download Backup
                        </Button>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                <Upload size={20} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Restore Backup</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Upload a previously exported backup file to restore your data.
                        </p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept=".json" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        <Button onClick={handleImportClick} variant="outline" className="w-full">
                            Upload Backup
                        </Button>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
                        <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-red-700 dark:text-red-400 text-sm">Warning</h4>
                            <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                                Clearing your browser cache/cookies will delete all your documents unless you have a backup.
                            </p>
                        </div>
                </div>
            </div>
        </div>
    );
};
