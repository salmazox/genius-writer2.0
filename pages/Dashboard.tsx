import React, { useState, useMemo } from 'react';
import { Menu, X, LayoutTemplate, FileText, Globe, Search } from 'lucide-react';
import { ToolType } from '../types';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useToast } from '../contexts/ToastContext';
import { getTools, IconMap } from '../config/tools';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

// Import refactored features
import CvBuilder from '../features/CvBuilder';
import Translator from '../features/Translator';
import GenericTool from '../features/GenericTool';

const Dashboard: React.FC = () => {
  const { t } = useThemeLanguage();
  const { showToast } = useToast();
  
  // Load tools from config
  const TOOLS = getTools(t);

  // State
  const [activeToolId, setActiveToolId] = useState<ToolType>(ToolType.CV_BUILDER);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeTool = TOOLS.find(t => t.id === activeToolId) || TOOLS[0];

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;
    const query = searchQuery.toLowerCase();
    return TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    );
  }, [TOOLS, searchQuery]);

  // --- Keyboard Shortcuts ---
  useKeyboardShortcuts([
      {
          combo: { key: 'k', ctrlKey: true },
          handler: () => {
             const searchInput = document.getElementById('tool-search');
             if (searchInput) searchInput.focus();
          }
      },
      {
          combo: { key: 's', ctrlKey: true },
          handler: (e) => {
              e.preventDefault();
              showToast("Project saved (Auto-save active)", "success");
          }
      },
      {
          combo: { key: 'Escape' },
          handler: () => {
            setIsMobileMenuOpen(false);
            const searchInput = document.getElementById('tool-search');
            if (document.activeElement === searchInput) {
                searchInput?.blur();
            }
          }
      }
  ]);

  // --- Subcomponents ---

  const ToolList = ({ onItemClick }: { onItemClick?: () => void }) => {
    const categories = Array.from(new Set(filteredTools.map(t => t.category)));
    
    if (filteredTools.length === 0) {
        return <div className="p-4 text-center text-sm text-slate-500">No tools found for "{searchQuery}"</div>;
    }

    return (
       <div className="space-y-6">
       {categories.map(category => (
           <div key={category}>
               <h3 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{category}</h3>
               <div className="space-y-1">
                   {filteredTools.filter(t => t.category === category).map(tool => {
                   const Icon = IconMap[tool.icon] || FileText;
                   return (
                       <button
                       key={tool.id}
                       onClick={() => {
                           setActiveToolId(tool.id);
                           if (onItemClick) onItemClick();
                       }}
                       className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                           activeToolId === tool.id
                           ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                           : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                       }`}
                       >
                       <Icon size={16} className={activeToolId === tool.id ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} />
                       <div className="text-left">
                           <div className="leading-none">{tool.name}</div>
                           {searchQuery && <div className="text-[10px] opacity-70 mt-1 font-normal truncate max-w-[140px]">{tool.description}</div>}
                       </div>
                       </button>
                   );
                   })}
               </div>
           </div>
       ))}
       </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans relative">
      
      {/* Sidebar: Full or Collapsed based on Tool - Hidden on Tablet/Mobile (lg) */}
      {(activeToolId !== ToolType.TRANSLATE && activeToolId !== ToolType.CV_BUILDER) ? (
          <aside className="w-64 hidden lg:flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 transition-colors duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <LayoutTemplate size={16} className="text-indigo-600 dark:text-indigo-400" />
                        {t('dashboard.templateLibrary')}
                    </h2>
                </div>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        id="tool-search"
                        type="text" 
                        placeholder="Search tools... (Ctrl+K)" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <ToolList />
            </div>
        </aside>
      ) : (
          <aside className="w-16 hidden lg:flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 items-center py-4 gap-4 z-20">
             <button onClick={() => setActiveToolId(ToolType.BLOG_FULL)} className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors group relative" title="Back to Library">
                 <LayoutTemplate size={20} />
                 <span className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">Library</span>
             </button>
             <div className="w-8 h-px bg-slate-200 dark:bg-slate-700"></div>
             <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                 {activeToolId === ToolType.CV_BUILDER ? <FileText size={20} /> : <Globe size={20} />}
             </div>
          </aside>
      )}

      {/* Mobile/Tablet Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-3/4 max-w-xs bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full animate-in slide-in-from-left">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <LayoutTemplate size={16} className="text-indigo-600 dark:text-indigo-400" />
                {t('dashboard.templateLibrary')}
              </h2>
              <button onClick={() => setIsMobileMenuOpen(false)}><X className="text-slate-500" /></button>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search tools..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ToolList onItemClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
         {/* Mobile/Tablet Header Toggle */}
         <div className="lg:hidden h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 justify-between flex-shrink-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 dark:text-slate-300">
                <Menu size={20} />
            </button>
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate mx-4">{activeTool.name}</span>
            <div className="w-5"></div>
         </div>

        <div className="flex-1 overflow-hidden relative">
            {activeToolId === ToolType.CV_BUILDER && <CvBuilder />}
            {activeToolId === ToolType.TRANSLATE && <Translator />}
            {activeToolId !== ToolType.CV_BUILDER && activeToolId !== ToolType.TRANSLATE && (
                <GenericTool tool={activeTool} />
            )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;