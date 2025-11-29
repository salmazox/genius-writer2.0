
import React, { useState, useMemo, useEffect } from 'react';
import { Menu, X, LayoutTemplate, FileText, Globe, Search, FileEdit, ArrowLeft, Grid, Folder, Trash2, Plus, Tag, MoreVertical, FolderPlus, MoveRight } from 'lucide-react';
import { ToolType, SavedDocument, Folder as FolderType } from '../types';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useToast } from '../contexts/ToastContext';
import { getTools, IconMap } from '../config/tools';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { documentService } from '../services/documentService';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Forms';
import { OnboardingTour } from '../components/OnboardingTour';

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

  // Core State
  const [activeToolId, setActiveToolId] = useState<ToolType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'library' | 'documents'>('library');
  
  // Data State
  const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Modal States
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [docToMove, setDocToMove] = useState<SavedDocument | null>(null);

  const activeTool = activeToolId ? TOOLS.find(t => t.id === activeToolId) : null;

  // Initial Onboarding Check
  useEffect(() => {
      const hasCompletedOnboarding = localStorage.getItem('genius_writer_onboarding_complete');
      if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
      }
  }, []);

  const completeOnboarding = () => {
      localStorage.setItem('genius_writer_onboarding_complete', 'true');
      setShowOnboarding(false);
  };

  // Refresh Data
  const refreshData = () => {
      setSavedDocs(documentService.getAll());
      setFolders(documentService.getFolders());
  };

  useEffect(() => {
      if (viewMode === 'documents') {
          refreshData();
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

  // Filter Docs based on search (title + content), folder, and tags
  const filteredDocs = useMemo(() => {
      let docs = savedDocs;
      
      // Folder Filter
      if (activeFolderId) {
          docs = docs.filter(d => d.folderId === activeFolderId);
      }

      // Tag Filter
      if (selectedTags.length > 0) {
          docs = docs.filter(d => d.tags && d.tags.some(t => selectedTags.includes(t)));
      }

      // Search Filter (Title OR Content)
      if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          docs = docs.filter(d => 
              d.title.toLowerCase().includes(q) || 
              (d.content && d.content.toLowerCase().includes(q))
          );
      }

      return docs;
  }, [savedDocs, activeFolderId, selectedTags, searchQuery]);

  // --- Actions ---

  const handleCreateFolder = () => {
      if (!newFolderName.trim()) return;
      documentService.createFolder(newFolderName);
      setNewFolderName('');
      setIsNewFolderModalOpen(false);
      refreshData();
      showToast("Folder created", "success");
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('Are you sure you want to delete this document?')) {
          documentService.delete(id);
          refreshData();
          showToast('Document deleted', 'info');
      }
  };

  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('Delete folder? Documents inside will be moved to root.')) {
          documentService.deleteFolder(id);
          if (activeFolderId === id) setActiveFolderId(undefined);
          refreshData();
          showToast('Folder deleted', 'info');
      }
  };

  const handleMoveDoc = (folderId: string | undefined) => {
      if (docToMove) {
          documentService.moveToFolder(docToMove.id, folderId);
          setDocToMove(null);
          refreshData();
          showToast('Document moved', 'success');
      }
  };

  const handleOpenDoc = (doc: SavedDocument) => {
      // Inject into legacy drafts
      if (doc.templateId === ToolType.CV_BUILDER) {
          localStorage.setItem('cv_draft', doc.content);
      } else if (doc.templateId === ToolType.SMART_EDITOR) {
          localStorage.setItem('smart_editor_content', doc.content);
          localStorage.setItem('smart_editor_title', doc.title);
      } else {
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

  const ToolList = () => {
    const categories = Array.from(new Set(filteredTools.map(t => t.category)));
    
    if (filteredTools.length === 0) {
        return <div className="p-8 text-center text-slate-500">No tools found matching "{searchQuery}"</div>;
    }

    return (
       <div className="space-y-8 pb-10 animate-in slide-in-from-bottom-4 duration-500">
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
                                onClick={() => setActiveToolId(tool.id)} 
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
      // If no docs at all in system
      if (savedDocs.length === 0) {
          return (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Folder size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No documents yet</h3>
                  <p className="text-slate-500 mb-6">Create content with a tool and save it to see it here.</p>
                  <Button onClick={() => setViewMode('library')}>Go to Library</Button>
              </div>
          );
      }

      return (
          <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
              {/* Folders Sidebar */}
              <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Folders</h3>
                          <button onClick={() => setIsNewFolderModalOpen(true)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Plus size={16} className="text-indigo-600"/></button>
                      </div>
                      <div className="space-y-1">
                          <button 
                             onClick={() => setActiveFolderId(undefined)}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between group ${activeFolderId === undefined ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                              <span className="flex items-center gap-2"><Grid size={16}/> All Documents</span>
                              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-1.5 rounded-full">{savedDocs.length}</span>
                          </button>
                          {folders.map(folder => (
                              <button 
                                  key={folder.id}
                                  onClick={() => setActiveFolderId(folder.id)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between group ${activeFolderId === folder.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                              >
                                  <span className="flex items-center gap-2 truncate"><Folder size={16}/> {folder.name}</span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-xs bg-slate-200 dark:bg-slate-700 px-1.5 rounded-full">{savedDocs.filter(d => d.folderId === folder.id).length}</span>
                                     <span onClick={(e) => handleDeleteFolder(folder.id, e)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"><X size={12}/></span>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Document Grid */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredDocs.length === 0 ? (
                      <div className="text-center py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                          <p>No documents found matching criteria.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {filteredDocs.map(doc => (
                              <div key={doc.id} onClick={() => handleOpenDoc(doc)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md cursor-pointer group relative transition-all hover:-translate-y-1">
                                  <div className="flex items-start justify-between mb-3">
                                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                          <FileText size={20} />
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={(e) => { e.stopPropagation(); setDocToMove(doc); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Move to folder">
                                              <MoveRight size={16} />
                                          </button>
                                          <button onClick={(e) => handleDeleteDoc(doc.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="Delete">
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                                  <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{doc.title}</h3>
                                  
                                  {/* Content snippet for search context */}
                                  {searchQuery && doc.content && (
                                      <p className="text-xs text-slate-400 mb-2 italic truncate">
                                          "...{doc.content.replace(/<[^>]*>/g, '').substring(0, 40)}..."
                                      </p>
                                  )}

                                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                      <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                                      {doc.folderId && (
                                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                                              <Folder size={10} /> {folders.find(f => f.id === doc.folderId)?.name}
                                          </span>
                                      )}
                                  </div>
                                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{doc.templateId}</span>
                                      <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">Open &rarr;</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
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
      
      {showOnboarding && <OnboardingTour onComplete={completeOnboarding} />}

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
                                placeholder="Search templates or documents..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
                             />
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex justify-center gap-4 mb-8">
                            <button 
                                onClick={() => setViewMode('library')} 
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'library' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <LayoutTemplate size={16} className="inline mr-2"/> Templates
                            </button>
                            <button 
                                onClick={() => setViewMode('documents')} 
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'documents' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Folder size={16} className="inline mr-2"/> My Documents
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

      {/* Modals */}
      <Modal 
          isOpen={isNewFolderModalOpen} 
          onClose={() => setIsNewFolderModalOpen(false)} 
          title="Create New Folder"
          footer={
              <>
                  <Button variant="ghost" onClick={() => setIsNewFolderModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateFolder}>Create Folder</Button>
              </>
          }
      >
          <Input 
              label="Folder Name" 
              placeholder="e.g. Marketing Q3" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
          />
      </Modal>

      <Modal
          isOpen={!!docToMove}
          onClose={() => setDocToMove(null)}
          title="Move Document"
      >
          <div className="space-y-2">
              <button 
                  onClick={() => handleMoveDoc(undefined)}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
              >
                  <Grid size={18} /> Root (No Folder)
              </button>
              {folders.map(f => (
                   <button 
                      key={f.id}
                      onClick={() => handleMoveDoc(f.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium text-indigo-600"
                  >
                      <Folder size={18} /> {f.name}
                  </button>
              ))}
          </div>
      </Modal>

    </div>
  );
};

export default Dashboard;
