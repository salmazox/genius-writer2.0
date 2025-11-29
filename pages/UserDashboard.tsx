
import React, { useState, useRef } from 'react';
import { 
    User as UserIcon, Settings, CreditCard, 
    LogOut, Link as LinkIcon, LayoutDashboard, Menu, X, Download, Upload, AlertTriangle
} from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { documentService } from '../services/documentService';

// Import Feature Views
import { OverviewView } from '../features/dashboard/OverviewView';
import { ProfileView } from '../features/dashboard/ProfileView';
import { BillingView } from '../features/dashboard/BillingView';
import { IntegrationsView } from '../features/dashboard/IntegrationsView';
import { Button } from '../components/ui/Button';

type DashboardTab = 'overview' | 'profile' | 'billing' | 'integrations' | 'settings';

const UserDashboard: React.FC = () => {
    const { user, logout, updateUser, toggleLinkedAccount } = useUser();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const SidebarItem = ({ id, icon: Icon, label, danger = false }: { id: DashboardTab | 'logout', icon: React.ElementType, label: string, danger?: boolean }) => (
        <button 
            onClick={() => {
                if (id === 'logout') logout();
                else {
                    setActiveTab(id as DashboardTab);
                    setIsMobileMenuOpen(false);
                }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                (activeTab as string) === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                : danger 
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </button>
    );

    const SettingsView = () => {
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
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Data Management</h2>
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 py-6 md:py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                
                {/* Mobile Menu Toggle */}
                <div className="lg:hidden mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeTab}</h1>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className={`w-full lg:w-64 flex-shrink-0 space-y-6 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                         <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-md mb-4 overflow-hidden">
                            {user.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-slate-400 m-auto mt-4"/>}
                         </div>
                         <h2 className="font-bold text-slate-900 dark:text-white text-lg">{user.name}</h2>
                         <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 truncate w-full">{user.email}</p>
                    </div>
                    <nav className="space-y-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
                        <SidebarItem id="profile" icon={UserIcon} label="Profile Settings" />
                        <SidebarItem id="billing" icon={CreditCard} label="Billing & Invoices" />
                        <SidebarItem id="integrations" icon={LinkIcon} label="Integrations" />
                        <SidebarItem id="settings" icon={Settings} label="General Settings" />
                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                             <SidebarItem id="logout" icon={LogOut} label="Log Out" danger />
                        </div>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="hidden lg:block mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeTab}</h1>
                    </div>
                    
                    <div className="min-h-[400px]">
                        {activeTab === 'overview' && <OverviewView user={user} />}
                        {activeTab === 'profile' && <ProfileView user={user} updateUser={updateUser} />}
                        {activeTab === 'billing' && <BillingView />}
                        {activeTab === 'integrations' && <IntegrationsView user={user} toggleLinkedAccount={toggleLinkedAccount} />}
                        {activeTab === 'settings' && <SettingsView />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
