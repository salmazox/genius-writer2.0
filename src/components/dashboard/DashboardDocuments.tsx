
import React from 'react';
import { 
    Folder, Grid, Trash2, Plus, X, Tag, FileText, RefreshCw, Copy, MoveRight, Share2, FilePlus, Ghost, ChevronDown
} from 'lucide-react';
import { SavedDocument, Folder as FolderType } from '../../types';
import { Button } from '../ui/Button';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';

export type SortOrder = 'newest' | 'oldest' | 'az' | 'za';

interface DashboardDocumentsProps {
    documents: SavedDocument[];
    folders: FolderType[];
    viewMode: 'documents' | 'trash';
    activeFolderId: string | undefined;
    searchQuery: string;
    selectedTags: string[];
    allTags: string[];
    sortOrder: SortOrder;
    
    setViewMode: (mode: 'documents' | 'trash') => void;
    setActiveFolderId: (id: string | undefined) => void;
    onToggleTag: (tag: string) => void;
    onCreateFolder: () => void;
    onDeleteFolder: (id: string, e: React.MouseEvent) => void;
    onSortChange: (order: SortOrder) => void;
    
    // Document Actions
    onOpenDoc: (doc: SavedDocument) => void;
    onShareDoc: (doc: SavedDocument, e: React.MouseEvent) => void;
    onDuplicateDoc: (id: string, e: React.MouseEvent) => void;
    onMoveDoc: (doc: SavedDocument, e: React.MouseEvent) => void;
    onDeleteDoc: (id: string, e: React.MouseEvent) => void;
    onRestoreDoc: (id: string, e: React.MouseEvent) => void;
    onPermanentDelete: (id: string, e: React.MouseEvent) => void;
}

export const DashboardDocuments: React.FC<DashboardDocumentsProps> = ({
    documents, folders, viewMode, activeFolderId, searchQuery, selectedTags, allTags, sortOrder,
    setViewMode, setActiveFolderId, onToggleTag, onCreateFolder, onDeleteFolder, onSortChange,
    onOpenDoc, onShareDoc, onDuplicateDoc, onMoveDoc, onDeleteDoc, onRestoreDoc, onPermanentDelete
}) => {
    const { t } = useThemeLanguage();
    const isEmpty = documents.length === 0;

    const getToolName = (id: string) => {
        return id.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] animate-in fade-in duration-500" data-tour="documents-section">
            {/* Folders & Tags Sidebar */}
            {/* Mobile: Constrained height to allow grid visibility. Desktop: Full height sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 max-h-[35vh] md:max-h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-4 md:pb-0">
                
                {/* Folders */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Folders</h3>
                        <button onClick={onCreateFolder} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" aria-label="Create Folder"><Plus size={16} className="text-indigo-600"/></button>
                    </div>
                    <div className="space-y-1">
                        <button 
                           onClick={() => { setViewMode('documents'); setActiveFolderId(undefined); }}
                           className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between group ${viewMode === 'documents' && activeFolderId === undefined ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="flex items-center gap-2"><Grid size={16}/> All Documents</span>
                        </button>
                        {folders.map(folder => (
                            <button 
                                key={folder.id}
                                onClick={() => { setViewMode('documents'); setActiveFolderId(folder.id); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between group ${viewMode === 'documents' && activeFolderId === folder.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <span className="flex items-center gap-2 truncate"><Folder size={16}/> {folder.name}</span>
                                <div className="flex items-center gap-2">
                                   <span onClick={(e) => onDeleteFolder(folder.id, e)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"><X size={12}/></span>
                                </div>
                            </button>
                        ))}
                        
                        <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
                        
                        <button 
                           onClick={() => setViewMode('trash')}
                           className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between group ${viewMode === 'trash' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <span className="flex items-center gap-2"><Trash2 size={16}/> Trash</span>
                        </button>
                    </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && viewMode !== 'trash' && (
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Filter by Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => onToggleTag(tag)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${selectedTags.includes(tag) ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300' : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:border-slate-300'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Document Grid */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-24 md:pb-0">
                {/* Grid Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-1 gap-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {viewMode === 'trash' ? 'Trash' : 'My Documents'} 
                        <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{documents.length}</span>
                    </h2>
                    
                    {!isEmpty && (
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 shadow-sm w-full sm:w-auto">
                            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{t('dashboard.sort.label')}:</span>
                            <div className="relative flex-1 sm:flex-none">
                                <select 
                                    value={sortOrder} 
                                    onChange={(e) => onSortChange(e.target.value as SortOrder)}
                                    className="text-sm font-semibold bg-transparent outline-none appearance-none pr-4 cursor-pointer text-slate-700 dark:text-slate-300 w-full"
                                >
                                    <option value="newest">{t('dashboard.sort.newest')}</option>
                                    <option value="oldest">{t('dashboard.sort.oldest')}</option>
                                    <option value="az">{t('dashboard.sort.az')}</option>
                                    <option value="za">{t('dashboard.sort.za')}</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-0 top-1.5 text-slate-400 pointer-events-none"/>
                            </div>
                        </div>
                    )}
                </div>

                {viewMode === 'trash' && !isEmpty && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                        <Trash2 size={16} /> Items in Trash are not permanently deleted yet. Restore them to edit.
                    </div>
                )}

                {isEmpty ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 min-h-[300px] md:min-h-[400px]">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 relative">
                            {viewMode === 'trash' ? (
                                <Trash2 size={40} className="text-slate-400"/>
                            ) : (
                                <>
                                    <FilePlus size={40} className="text-indigo-400"/>
                                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                                        <Ghost size={20} className="text-indigo-300"/>
                                    </div>
                                </>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {viewMode === 'trash' ? "Trash is empty" : "No documents found"}
                        </h3>
                        <p className="text-slate-500 mb-8 max-w-xs leading-relaxed">
                            {viewMode === 'trash' 
                                ? "Items you delete will appear here. Keep your workspace tidy!" 
                                : searchQuery 
                                    ? `We couldn't find anything matching "${searchQuery}".` 
                                    : "Start your journey by creating your first document from the Template Library."}
                        </p>
                        {viewMode !== 'trash' && !searchQuery && (
                            <Button onClick={() => window.location.reload()} variant="primary">Browse Templates</Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                        {documents.map(doc => (
                            <div 
                              key={doc.id} 
                              onClick={() => onOpenDoc(doc)} 
                              className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg group relative transition-all duration-300 flex flex-col h-full ${viewMode === 'trash' ? 'opacity-80 hover:opacity-100' : 'cursor-pointer hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${viewMode === 'trash' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'}`}>
                                        <FileText size={20} />
                                    </div>
                                    
                                    {/* Document Actions - Always visible on mobile if needed, or group hover */}
                                    <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-100 dark:border-slate-800 absolute top-4 right-4">
                                        {viewMode === 'trash' ? (
                                            <>
                                              <button onClick={(e) => onRestoreDoc(doc.id, e)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Restore">
                                                  <RefreshCw size={14} />
                                              </button>
                                              <button onClick={(e) => onPermanentDelete(doc.id, e)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Forever">
                                                  <X size={14} />
                                              </button>
                                            </>
                                        ) : (
                                            <>
                                              <button onClick={(e) => onShareDoc(doc, e)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Share">
                                                  <Share2 size={14} />
                                              </button>
                                              <button onClick={(e) => onDuplicateDoc(doc.id, e)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Duplicate">
                                                  <Copy size={14} />
                                              </button>
                                              <button onClick={(e) => onMoveDoc(doc, e)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Move to folder">
                                                  <MoveRight size={14} />
                                              </button>
                                              <button onClick={(e) => onDeleteDoc(doc.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Move to Trash">
                                                  <Trash2 size={14} />
                                              </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 truncate text-base">{doc.title}</h3>
                                    
                                    {/* Content snippet for search context */}
                                    {searchQuery && doc.content && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic truncate bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded">
                                            "...{doc.content.replace(/<[^>]*>/g, '').substring(0, 40)}..."
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
                                        <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                                        {doc.folderId && (
                                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                                                <Folder size={10} /> {folders.find(f => f.id === doc.folderId)?.name}
                                            </span>
                                        )}
                                        {doc.tags && doc.tags.length > 0 && (
                                            <div className="flex gap-1">
                                                {doc.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-indigo-100 dark:border-indigo-800">
                                                        <Tag size={8} /> {tag}
                                                    </span>
                                                ))}
                                                {doc.tags.length > 2 && <span className="text-[10px] text-slate-400">+{doc.tags.length - 2}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs mt-auto">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-medium">{getToolName(doc.templateId)}</span>
                                    {viewMode !== 'trash' && (
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">Open <MoveRight size={10}/></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
