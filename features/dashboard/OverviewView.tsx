
import React from 'react';
import { BarChart2, FileText, Zap } from 'lucide-react';
import { User } from '../../types';

interface OverviewViewProps {
    user: User;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ user }) => {
    const mockUsage = {
        wordsUsed: 12500,
        wordsLimit: 50000,
        documents: 24,
        imagesGenerated: 5
    };

    const recentDocs = [
        { id: 1, title: 'Q3 Marketing Strategy', date: '2 hours ago', type: 'Blog' },
        { id: 2, title: 'Product Launch Email', date: 'Yesterday', type: 'Email' },
        { id: 3, title: 'Senior Developer CV', date: '3 days ago', type: 'CV' },
    ];

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
                        {(mockUsage.wordsUsed / 1000).toFixed(1)}k <span className="text-sm font-normal text-slate-400">/ {(mockUsage.wordsLimit / 1000).toFixed(0)}k</span>
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(mockUsage.wordsUsed / mockUsage.wordsLimit) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Documents Created</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockUsage.documents}</p>
                </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Activity</h3>
                    <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentDocs.map(doc => (
                        <div key={doc.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">{doc.title}</h4>
                                    <p className="text-xs text-slate-500">{doc.date} • {doc.type}</p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
