import React, { useState, useMemo, useEffect } from 'react';
import { Menu, X, LayoutTemplate, FileText, Globe, Search, FileEdit, ArrowLeft, Grid, Folder, Trash2 } from 'lucide-react';
import { ToolType, SavedDocument } from '../types';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useToast } from '../contexts/ToastContext';
import { getTools, IconMap } from '../config/tools';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { documentService } from '../services/documentService';

// Import refactored features
import CvBuilder from '../features/CvBuilder';
import Translator from '../features/Translator';
import GenericTool from '../features/GenericTool';
import SmartEditor from '../features/SmartEditor';

const Dashboard: React.FC = () => {
  const { t } = useThemeLanguage();
  const { showToast } = useToast();
  
  // Load tools from config
  const TOOLS = getTools(t);

  // State: Default to null to show the Library/Home view
  const [activeToolId, setActiveToolId] = useState<ToolType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'library' | 'documents'>('library');
  const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([]);

  const activeTool = activeToolId ? TOOLS.find(t => t.id === activeToolId) : null;

  useEffect(() => {
      if (viewMode === 'documents') {
          setSavedDocs(documentService.getAll());
      }
  }, [viewMode]);

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
          handler: (e) => {
             const searchInput = document.getElementById('tool-search');
             if (searchInput) {
                 e.preventDefault();
                 searchInput.focus();
             }
          }
      },
      {
          combo: { key: 'Escape' },
          handler: () => {
            setIsMobileMenuOpen(false);
          }
      }
  ]);

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('Are you sure you want to delete this document?')) {
          documentService.delete(id);
          setSavedDocs(prev => prev.filter(d => d.id !== id));
          showToast('Document deleted', 'info');
      }
  };

  const handleOpenDoc = (doc: SavedDocument) => {
      // In a real app, we'd pass the ID to the tool. 
      // For this demo, we inject into the legacy draft storage the tool reads.
      if (doc.templateId === ToolType.CV_BUILDER) {
          localStorage.setItem('cv_draft', doc.content);
      } else if (doc.templateId === ToolType.SMART_EDITOR) {
          localStorage.setItem('smart_editor_content', doc.content);
          localStorage.setItem('smart_editor_title', doc.title);
      } else {
          // Generic tools
           localStorage.setItem(`draft_${doc.templateId}`, JSON.stringify({
              formValues: {},
              documentContent: doc.content,
              lastSaved: Date.now()
          }));
      }
      setActiveToolId(doc.templateId);
  };

  // --- Subcomponents ---

  const ToolGridItem: React.FC<{ tool: any, onClick: () => void }> = ({ tool, onClick }) => {
      const Icon = IconMap[tool.icon] || FileText;
      return (
        <button 
            onClick={onClick}
            className="flex flex-col items-start p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group text-left h-full"
        >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-4">
                <Icon size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tool.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tool.description}</p>
        </button>
      );
  };

  const ToolList = ({ onItemClick }: { onItemClick?: () => void }) => {
    const categories = Array.from(new Set(filteredTools.map(t => t.category)));
    
    if (filteredTools.length === 0) {
        return <div className="p-8 text-center text-slate-500">No tools found matching "{searchQuery}"</div>;
    }

    return (
       <div className="space-y-8 pb-10">
       {categories.map(category => {
           const categoryTools = filteredTools.filter(t => t.category === category);
           if (categoryTools.length === 0) return null;
           
           return (
               <div key={category}>
                   <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        {category}
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                       {categoryTools.map(tool => (
                           <ToolGridItem 
                                key={tool.id} 
                                tool={tool} 
                                onClick={() => {
                                    setActiveToolId(tool.id);
                                    if (onItemClick) onItemClick();
                                }} 
                           />
                       ))}
                   </div>
               </div>
           );
       })}
       </div>
    );
  };

  const DocumentsList = () => {
      if (savedDocs.length === 0) {
          return (
              <div className="text-center py-20">
                  <Folder size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No documents yet</h3>
                  <p className="text-slate-500">Create content with a tool and save it to see it here.</p>
                  <button onClick={() => setViewMode('library')} className="mt-4 text-indigo-600 font-bold hover:underline">Go to Library</button>
              </div>
          );
      }

      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDocs.map(doc => (
                  <div key={doc.id} onClick={() => handleOpenDoc(doc)} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md cursor-pointer group relative">
                      <div className="flex items-start justify-between mb-4">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                              <FileText size={20} />
                          </div>
                          <button onClick={(e) => handleDeleteDoc(doc.id, e)} className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                          </button>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{doc.title}</h3>
                      <p className="text-xs text-slate-500">Last modified: {new Date(doc.lastModified).toLocaleDateString()}</p>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{doc.templateId}</span>
                          <span className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Open &rarr;</span>
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  const SidebarToolList = () => (
      <div className="space-y-1">
        {filteredTools.map(tool => {
            const Icon = IconMap[tool.icon] || FileText;
            return (
                <button
                    key={tool.id}
                    onClick={() => setActiveToolId(tool.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        activeToolId === tool.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    <Icon size={16} className={activeToolId === tool.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} />
                    <span className="truncate">{tool.name}</span>
                </button>
            );
        })}
      </div>
  );

  const isFullWidthTool = (id: ToolType) => 
    id === ToolType.TRANSLATE || 
    id === ToolType.CV_BUILDER || 
    id === ToolType.SMART_EDITOR;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative">
      
      {/* Sidebar - Only visible when a tool is active */}
      {activeToolId && (
        !isFullWidthTool(activeToolId) ? (
            <aside className="w-64 hidden lg:flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 transition-colors duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => setActiveToolId(null)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} /> Back to Library
                    </button>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input 
                            id="tool-search"
                            type="text" 
                            placeholder="Find tool..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    <SidebarToolList />
                </div>
            </aside>
        ) : (
            <aside className="w-16 hidden lg:flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 items-center py-4 gap-4 z-20">
                <button 
                    onClick={() => setActiveToolId(null)} 
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-500 hover:text-indigo-600 transition-colors group relative" 
                    title="Back to Library"
                >
                    <Grid size={20} />
                    <span className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">Library</span>
                </button>
                <div className="w-8 h-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                    {activeToolId === ToolType.CV_BUILDER && <FileText size={20} />}
                    {activeToolId === ToolType.TRANSLATE && <Globe size={20} />}
                    {activeToolId === ToolType.SMART_EDITOR && <FileEdit size={20} />}
                </div>
            </aside>
        )
      )}

      {/* Mobile Menu Overlay */}
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
            
            <div className="p-4">
                 <button 
                    onClick={() => { setActiveToolId(null); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold mb-4"
                >
                    <Grid size={18} /> Library Home
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
               <div className="space-y-1">
                {filteredTools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => {
                            setActiveToolId(tool.id);
                            setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                            activeToolId === tool.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600'
                        }`}
                    >
                        <span className="truncate">{tool.name}</span>
                    </button>
                ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
         {/* Top Bar (Mobile Only) - Only when a tool is active */}
         {activeToolId && (
            <div className="lg:hidden h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 justify-between flex-shrink-0 z-30">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 dark:text-slate-300">
                    <Menu size={20} />
                </button>
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate mx-4">{activeTool?.name}</span>
                <button onClick={() => setActiveToolId(null)} className="text-slate-500">
                    <Grid size={20} />
                </button>
            </div>
         )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {!activeToolId ? (
                // Library View
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">What would you like to create?</h1>
                        <div className="max-w-md mx-auto relative mb-6">
                             <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                             <input 
                                type="text" 
                                placeholder="Search for CV, Blog, Email tools..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
                             />
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex justify-center gap-4 mb-8">
                            <button 
                                onClick={() => setViewMode('library')} 
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'library' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                Templates
                            </button>
                            <button 
                                onClick={() => setViewMode('documents')} 
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'documents' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                My Documents
                            </button>
                        </div>
                    </div>
                    
                    {viewMode === 'library' ? <ToolList /> : <DocumentsList />}
                </div>
            ) : (
                // Tool View
                <div className="h-full flex flex-col">
                    {activeToolId === ToolType.CV_BUILDER && <CvBuilder />}
                    {activeToolId === ToolType.TRANSLATE && <Translator />}
                    {activeToolId === ToolType.SMART_EDITOR && <SmartEditor />}
                    {!isFullWidthTool(activeToolId) && activeTool && (
                        <GenericTool tool={activeTool} />
                    )}
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;