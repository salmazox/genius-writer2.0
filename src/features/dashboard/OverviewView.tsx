import React, { useEffect, useState } from 'react';
import { BarChart2, FileText, Zap, Clock, Image as ImageIcon } from 'lucide-react';
import { User, SavedDocument } from '../../types';
import { documentService } from '../../services/documentService';
import { ToolType } from '../../types';
import { LIMITS } from '../../services/gemini';

interface OverviewViewProps {
    user: User;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ user }) => {
    const [stats, setStats] = useState({
        wordsUsed: 0,
        wordsLimit: 2000, 
        imagesUsed: 0,
        imagesLimit: 0,
        savedDocsCount: 0
    });
    const [recentDocs, setRecentDocs] = useState<SavedDocument[]>([]);

    useEffect(() => {
        const loadStats = () => {
            // Load Usage
            const USAGE_KEY = 'gw_usage_tracker';
            let wordsUsed = 0;
            let imagesUsed = 0;
            try {
                const data = localStorage.getItem(USAGE_KEY);
                if (data) {
                    const parsed = JSON.parse(data);
                    wordsUsed = parsed.wordsUsed || 0;
                    imagesUsed = parsed.imagesUsed || 0;
                }
            } catch (e) {
                console.error("Failed to load usage", e);
            }

            // Load Limits
            const plan = user.plan || 'free';
            const limit = LIMITS[plan] || LIMITS.free;

            // Load Docs Stats
            const docs = documentService.getAll();
            const activeDocs = docs.filter(d => !d.deletedAt);
            
            setStats({
                wordsUsed,
                wordsLimit: limit.words,
                imagesUsed,
                imagesLimit: limit.images,
                savedDocsCount: activeDocs.length
            });

            // Recent Docs
            setRecentDocs(activeDocs.sort((a, b) => b.lastModified - a.lastModified).slice(0, 3));
        };

        loadStats();
        
        // Listen for usage updates
        window.addEventListener('usage_updated', loadStats);
        return () => window.removeEventListener('usage_updated', loadStats);
    }, [user.plan]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user.name.split(' ')[0]}!</h1>
                    <p className="text-indigo-100 max-w-lg">
                        You have generated <span className="font-bold text-white">{stats.wordsUsed.toLocaleString()} words</span> this month. 
                        Keep up the creativity!
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">
                        <Zap size={18} className="text-yellow-500" /> Word Usage
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.wordsUsed.toLocaleString()}</span>
                            <span className="text-sm text-slate-500">/ {stats.wordsLimit === Infinity ? '∞' : stats.wordsLimit.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-yellow-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${stats.wordsLimit === Infinity ? 0 : Math.min(100, (stats.wordsUsed / stats.wordsLimit) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">
                        <ImageIcon size={18} className="text-pink-500" /> Image Gen
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.imagesUsed}</span>
                            <span className="text-sm text-slate-500">/ {stats.imagesLimit === Infinity ? '∞' : stats.imagesLimit}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-pink-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${stats.imagesLimit === Infinity || stats.imagesLimit === 0 ? 0 : Math.min(100, (stats.imagesUsed / stats.imagesLimit) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">
                        <FileText size={18} className="text-indigo-500" /> Documents
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats.savedDocsCount}</span>
                        <p className="text-xs text-slate-500">Total active documents across all folders.</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock size={20} className="text-slate-400"/> Recent Activity
                    </h2>
                </div>
                {recentDocs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        No documents yet. Start creating!
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentDocs.map(doc => (
                            <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.title}</h3>
                                    <p className="text-xs text-slate-500 truncate">
                                        Edited {new Date(doc.lastModified).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                                    {doc.templateId.replace(/_/g, ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};