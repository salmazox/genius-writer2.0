
import React from 'react';
import { Star } from 'lucide-react';
import { ToolGridItem } from './ToolGridItem';
import { ToolConfig, ToolType } from '../../types';

interface DashboardLibraryProps {
    tools: ToolConfig[];
    searchQuery: string;
    onSelectTool: (id: ToolType) => void;
    favoriteToolIds: ToolType[];
    onToggleFavorite: (id: ToolType) => void;
}

export const DashboardLibrary: React.FC<DashboardLibraryProps> = ({ 
    tools, 
    searchQuery, 
    onSelectTool, 
    favoriteToolIds, 
    onToggleFavorite 
}) => {
    const categories = Array.from(new Set(tools.map(t => t.category)));
    const favoriteTools = tools.filter(t => favoriteToolIds.includes(t.id));

    if (tools.length === 0) {
        return <div className="p-8 text-center text-slate-500">No tools found matching "{searchQuery}"</div>;
    }

    return (
       <div className="space-y-10 pb-10 animate-in slide-in-from-bottom-4 duration-500">
           
        {/* Favorites Section */}
        {favoriteTools.length > 0 && !searchQuery && (
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/20">
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Star size={14} fill="currentColor" /> Your Favorites
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteTools.map(tool => (
                        <ToolGridItem 
                            key={tool.id} 
                            tool={tool} 
                            onClick={() => onSelectTool(tool.id)}
                            isFavorite={true}
                            onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(tool.id); }}
                        />
                    ))}
                </div>
            </div>
        )}

       {categories.map(category => {
           const categoryTools = tools.filter(t => t.category === category);
           if (categoryTools.length === 0) return null;
           
           return (
               <div key={category}>
                   <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        {category}
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                       {categoryTools.map(tool => (
                           <ToolGridItem 
                                key={tool.id} 
                                tool={tool} 
                                onClick={() => onSelectTool(tool.id)}
                                isFavorite={favoriteToolIds.includes(tool.id)}
                                onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(tool.id); }}
                           />
                       ))}
                   </div>
               </div>
           );
       })}
       </div>
    );
};
