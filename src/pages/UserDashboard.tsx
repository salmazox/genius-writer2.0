
import React, { useState, Suspense, lazy } from 'react';
import {
    User as UserIcon, Settings, CreditCard,
    LogOut, Link as LinkIcon, LayoutDashboard, Menu, X, Loader2
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

// Lazy load dashboard views for better performance
const OverviewView = lazy(() => import('../features/dashboard/OverviewView').then(m => ({ default: m.OverviewView })));
const ProfileView = lazy(() => import('../features/dashboard/ProfileView').then(m => ({ default: m.ProfileView })));
const BillingView = lazy(() => import('../features/dashboard/BillingView').then(m => ({ default: m.BillingView })));
const IntegrationsView = lazy(() => import('../features/dashboard/IntegrationsView').then(m => ({ default: m.IntegrationsView })));
const SettingsView = lazy(() => import('../features/dashboard/SettingsView').then(m => ({ default: m.SettingsView })));

type DashboardTab = 'overview' | 'profile' | 'billing' | 'integrations' | 'settings';

const UserDashboard: React.FC = () => {
    const { user, logout, updateUser, toggleLinkedAccount } = useUser();
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

                    <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                        </div>
                    }>
                        <div className="min-h-[400px]">
                            {activeTab === 'overview' && <OverviewView user={user} />}
                            {activeTab === 'profile' && <ProfileView user={user} updateUser={updateUser} />}
                            {activeTab === 'billing' && <BillingView />}
                            {activeTab === 'integrations' && <IntegrationsView user={user} toggleLinkedAccount={toggleLinkedAccount} />}
                            {activeTab === 'settings' && <SettingsView />}
                        </div>
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
