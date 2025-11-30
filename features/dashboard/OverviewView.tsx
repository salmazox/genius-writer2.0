
import React, { useEffect, useState } from 'react';
import { BarChart2, FileText, Zap, Clock } from 'lucide-react';
import { User, SavedDocument } from '../../types';
import { documentService } from '../../services/documentService';
import { ToolType } from '../../types';

interface OverviewViewProps {
    user: User;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ user }) => {
    const [stats, setStats] = useState({
        wordsUsed: 0,
        wordsLimit: 2000, 
        documents: 0,
        recentDocs: [] as SavedDocument[]
    });

    useEffect(() => {
        const docs = documentService.getAll();
        
        // Read real usage from tracker
        let usage = { wordsUsed: 0 };
        try {
            const usageData = localStorage.getItem('gw_usage_tracker');
            if (usageData) {
                usage = JSON.parse(usageData);
            }
        } catch (e) {}

        // Determine limit based on user plan
        let limit = 2000;
        if (user.plan === 'pro') limit = 50000;
        if (user.plan === 'agency') limit = 200000;
        if (user.plan === 'enterprise') limit = Infinity;

        // Sort by date desc
        const sorted = [...docs].sort((a, b) => b.lastModified - a.lastModified).slice(0, 3);

        setStats({
            wordsUsed: usage.wordsUsed,
            wordsLimit: limit,
            documents: docs.length,
            recentDocs: sorted
        });

        const handleUsageUpdate = () => {
             let updatedUsage = { wordsUsed: 0 };
             try {
                const u = localStorage.getItem('gw_usage_tracker');
                if (u) updatedUsage = JSON.parse(u);
             } catch {}
             setStats(prev => ({ ...prev, wordsUsed: updatedUsage.wordsUsed }));
        };

        window.addEventListener('usage_updated', handleUsageUpdate);
        return () => window.removeEventListener('usage_updated', handleUsageUpdate);

    }, [user.plan]);

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getToolName = (id: ToolType) => {
        return id.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Words Generated</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {(stats.wordsUsed / 1000).toFixed(1)}k <span className="text-sm font-normal text-slate-400">/ {stats.wordsLimit === Infinity ? 'Unlim' : (stats.wordsLimit / 1000).toFixed(0) + 'k'}</span>
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4">
                        <div className={`h-1.5 rounded-full ${stats.wordsUsed >= stats.wordsLimit ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${Math.min((stats.wordsUsed / (stats.wordsLimit === Infinity ? 1000000 : stats.wordsLimit)) * 100, 100)}%` }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Documents Created</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.documents}</p>
                </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Activity</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.recentDocs.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">No documents yet. Start writing!</div>
                    ) : (
                        stats.recentDocs.map(doc => (
                            <div key={doc.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">{doc.title}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                            <Clock size={10} /> {formatRelativeTime(doc.lastModified)} • {getToolName(doc.templateId)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
