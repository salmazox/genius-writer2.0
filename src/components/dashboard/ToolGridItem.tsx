
import React from 'react';
import { Star, FileText } from 'lucide-react';
import { IconMap } from '../../config/tools';
import { ToolConfig } from '../../types';

interface ToolGridItemProps {
    tool: ToolConfig;
    onClick: () => void;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
}

export const ToolGridItem: React.FC<ToolGridItemProps> = React.memo(({ tool, onClick, isFavorite, onToggleFavorite }) => {
    const Icon = IconMap[tool.icon] || FileText;

    return (
        <div className="relative group h-full">
            <button
                onClick={onClick}
                className="w-full flex flex-col items-start p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 text-left h-full"
                data-tour="tool-card"
            >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-4">
                    <Icon size={24} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-6">{tool.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tool.description}</p>
            </button>
            <button 
                onClick={onToggleFavorite}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${isFavorite ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 opacity-100' : 'text-slate-300 hover:text-yellow-500 opacity-0 group-hover:opacity-100'}`}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
        </div>
    );
});
