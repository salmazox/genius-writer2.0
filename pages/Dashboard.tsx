
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, LayoutTemplate, FileText, Globe, Search, FileEdit, ArrowLeft, Grid, Folder, Mic } from 'lucide-react';
import { ToolType, SavedDocument, Folder as FolderType } from '../types';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useToast } from '../contexts/ToastContext';
import { getTools, IconMap } from '../config/tools';
import { documentService } from '../services/documentService';
import { Modal } from '../components/ui/Modal';
import { ShareModal } from '../components/ShareModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Forms';
import { OnboardingTour } from '../components/OnboardingTour';
import { useDebounce } from '../hooks/useDebounce';
import { useUser } from '../contexts/UserContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Import refactored features
import CvBuilder from '../features/CvBuilder';
import Translator from '../features/Translator';
import GenericTool from '../features/GenericTool';
import SmartEditor from '../features/SmartEditor';
import LiveInterview from '../features/LiveInterview'; // New Import

// Import New Dashboard Components
import { DashboardLibrary } from '../components/dashboard/DashboardLibrary';
import { DashboardDocuments, SortOrder } from '../components/dashboard/DashboardDocuments';

const Dashboard: React.FC = () => {
  const { t } = useThemeLanguage();
  const { showToast } = useToast();
  const { user, toggleFavoriteTool } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const TOOLS = getTools(t);

  // Core State (Synched with URL)
  const [activeToolId, setActiveToolId] = useState<ToolType | null>(() => {
      return searchParams.get('tool') as ToolType | null;
  });
  const [viewMode, setViewMode] = useState<'library' | 'documents' | 'trash'>(() => {
      const tab = searchParams.get('tab');
      return (tab === 'documents' || tab === 'trash') ? tab : 'library';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  
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
  const [docToShare, setDocToShare] = useState<SavedDocument | null>(null);

  const activeTool = activeToolId ? TOOLS.find(t => t.id === activeToolId) : null;

  // Sync State with URL changes (Back button, Deep links)
  useEffect(() => {
      const tool = searchParams.get('tool') as ToolType | null;
      const tab = searchParams.get('tab') as 'library' | 'documents' | 'trash' | null;

      if (tool !== activeToolId) {
          setActiveToolId(tool);
      }

      const targetViewMode = (tab === 'documents' || tab === 'trash') ? tab : 'library';
      if (!tool && targetViewMode !== viewMode) {
          setViewMode(targetViewMode);
      }
  }, [searchParams, activeToolId, viewMode]);

  // Helper to update URL (and thus trigger state update)
  const navigateTo = (params: { tool?: ToolType | null, tab?: 'library' | 'documents' | 'trash' }) => {
      const newParams: Record<string, string> = {};
      
      if (params.tool) {
          newParams.tool = params.tool;
      } else {
          newParams.tab = params.tab || 'library';
      }
      setSearchParams(newParams);
  };

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

  const refreshData = () => {
      setSavedDocs(documentService.getAll());
      setFolders(documentService.getFolders());
  };

  useEffect(() => {
      if (viewMode === 'documents' || viewMode === 'trash') {
          refreshData();
      }
  }, [viewMode, docToShare]);

  const allTags = useMemo(() => {
      const tags = new Set<string>();
      savedDocs
        .filter(d => !d.deletedAt)
        .forEach(doc => {
            if (doc.tags) doc.tags.forEach(t => tags.add(t));
        });
      return Array.from(tags).sort();
  }, [savedDocs]);

  const toggleTag = (tag: string) => {
      setSelectedTags(prev => 
          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
  };

  const filteredTools = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return TOOLS;
    const query = debouncedSearchQuery.toLowerCase();
    return TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    );
  }, [TOOLS, debouncedSearchQuery]);

  const filteredDocs = useMemo(() => {
      let docs = savedDocs;
      
      if (viewMode === 'trash') {
          docs = docs.filter(d => d.deletedAt !== undefined);
      } else {
          docs = docs.filter(d => d.deletedAt === undefined);
      }

      if (viewMode === 'documents' && activeFolderId) {
          docs = docs.filter(d => d.folderId === activeFolderId);
      }

      if (selectedTags.length > 0) {
          docs = docs.filter(d => d.tags && d.tags.some(t => selectedTags.includes(t)));
      }

      if (debouncedSearchQuery.trim()) {
          const q = debouncedSearchQuery.toLowerCase();
          docs = docs.filter(d => 
              d.title.toLowerCase().includes(q) || 
              (d.content && d.content.toLowerCase().includes(q))
          );
      }

      // Sort
      return docs.sort((a, b) => {
          if (sortOrder === 'newest') return b.lastModified - a.lastModified;
          if (sortOrder === 'oldest') return a.lastModified - b.lastModified;
          if (sortOrder === 'az') return a.title.localeCompare(b.title);
          if (sortOrder === 'za') return b.title.localeCompare(a.title);
          return 0;
      });
  }, [savedDocs, activeFolderId, selectedTags, debouncedSearchQuery, viewMode, sortOrder]);

  // --- Handlers ---

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
      documentService.delete(id);
      refreshData();
      showToast('Moved to Trash', 'info', {
          label: 'Undo',
          onClick: () => {
              documentService.restore(id);
              refreshData();
              showToast('Restored from Trash', 'success');
          }
      });
  };

  const handleRestoreDoc = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      documentService.restore(id);
      refreshData();
      showToast('Document restored', 'success');
  };

  const handlePermanentDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('Delete permanently? This cannot be undone.')) {
          documentService.hardDelete(id);
          refreshData();
          showToast('Deleted forever', 'info');
      }
  };

  const handleDuplicateDoc = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      documentService.duplicate(id);
      refreshData();
      showToast('Document duplicated', 'success');
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
      if (viewMode === 'trash') return;

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
      navigateTo({ tool: doc.templateId });
  };

  const SidebarToolList = () => (
      <div className="space-y-1">
        {filteredTools.map(tool => {
            const Icon = IconMap[tool.icon] || FileText;
            return (
                <button
                    key={tool.id}
                    onClick={() => navigateTo({ tool: tool.id })}
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
    id === ToolType.SMART_EDITOR ||
    id === ToolType.LIVE_INTERVIEW;

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative">
      
      {showOnboarding && <OnboardingTour onComplete={completeOnboarding} />}

      {/* Sidebar - Only visible when a tool is active */}
      {activeToolId && (
        !isFullWidthTool(activeToolId) ? (
            <aside className="w-64 hidden lg:flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 transition-colors duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => navigateTo({ tab: 'library' })}
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
                    onClick={() => navigateTo({ tab: 'library' })}
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
                    {activeToolId === ToolType.LIVE_INTERVIEW && <Mic size={20} />}
                </div>
            </aside>
        )
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
         {/* Top Bar (Mobile Only) */}
         {activeToolId && (
            <div className="lg:hidden h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 justify-between flex-shrink-0 z-30">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 dark:text-slate-300">
                    <Menu size={20} />
                </button>
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate mx-4">{activeTool?.name}</span>
                <button onClick={() => navigateTo({ tab: 'library' })} className="text-slate-500">
                    <Grid size={20} />
                </button>
            </div>
         )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {!activeToolId ? (
                // Library View
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
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
                                onClick={() => navigateTo({ tab: 'library' })}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'library' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <LayoutTemplate size={16} className="inline mr-2"/> Templates
                            </button>
                            <button 
                                onClick={() => navigateTo({ tab: 'documents' })}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'documents' || viewMode === 'trash' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Folder size={16} className="inline mr-2"/> My Documents
                            </button>
                        </div>
                    </div>
                    
                    {viewMode === 'library' ? (
                        <DashboardLibrary 
                            tools={filteredTools} 
                            searchQuery={debouncedSearchQuery} 
                            onSelectTool={(id) => navigateTo({ tool: id })}
                            favoriteToolIds={user.favorites || []}
                            onToggleFavorite={toggleFavoriteTool}
                        />
                    ) : (
                        <DashboardDocuments 
                            documents={filteredDocs}
                            folders={folders}
                            viewMode={viewMode === 'trash' ? 'trash' : 'documents'}
                            activeFolderId={activeFolderId}
                            searchQuery={debouncedSearchQuery}
                            selectedTags={selectedTags}
                            allTags={allTags}
                            sortOrder={sortOrder}
                            
                            setViewMode={(mode) => navigateTo({ tab: mode })}
                            setActiveFolderId={setActiveFolderId}
                            onToggleTag={toggleTag}
                            onCreateFolder={() => setIsNewFolderModalOpen(true)}
                            onDeleteFolder={handleDeleteFolder}
                            onSortChange={setSortOrder}
                            
                            onOpenDoc={handleOpenDoc}
                            onShareDoc={(doc, e) => { e.stopPropagation(); setDocToShare(doc); }}
                            onDuplicateDoc={handleDuplicateDoc}
                            onMoveDoc={(doc, e) => { e.stopPropagation(); setDocToMove(doc); }}
                            onDeleteDoc={handleDeleteDoc}
                            onRestoreDoc={handleRestoreDoc}
                            onPermanentDelete={handlePermanentDelete}
                        />
                    )}
                </div>
            ) : (
                // Tool View Wrapped in ErrorBoundary
                <ErrorBoundary>
                    <div className="h-full flex flex-col">
                        {activeToolId === ToolType.CV_BUILDER && <CvBuilder />}
                        {activeToolId === ToolType.TRANSLATE && <Translator />}
                        {activeToolId === ToolType.SMART_EDITOR && <SmartEditor />}
                        {activeToolId === ToolType.LIVE_INTERVIEW && <LiveInterview />}
                        {!isFullWidthTool(activeToolId) && activeTool && (
                            <GenericTool tool={activeTool} />
                        )}
                    </div>
                </ErrorBoundary>
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

      {docToShare && (
          <ShareModal 
              isOpen={!!docToShare}
              onClose={() => setDocToShare(null)}
              document={docToShare}
          />
      )}

    </div>
  );
};

export default Dashboard;