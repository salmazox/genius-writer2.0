
import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, X, Send, Sparkles, Sidebar, Check, Loader2, Download, Save, ShieldCheck, History, RotateCcw, FileType, MessageCircle, User as UserIcon, Share2, Quote
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ShareModal } from '../components/ShareModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { chatWithAI, factCheck } from '../services/gemini';
import { documentService } from '../services/documentService';
import { useToast } from '../contexts/ToastContext';
import { ToolType, SavedDocument, Comment } from '../types';
import { useUser } from '../contexts/UserContext';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const SmartEditor: React.FC = () => {
    const { showToast } = useToast();
    const { user } = useUser();
    
    // --- State ---
    const [content, setContent] = useLocalStorage<string>('smart_editor_content', '<h1>Untitled Document</h1><p>Start writing here...</p>');
    const [title, setTitle] = useLocalStorage<string>('smart_editor_title', 'Untitled Document');
    const [currentDoc, setCurrentDoc] = useState<SavedDocument | null>(null);
    const [activeSidebar, setActiveSidebar] = useState<'ai' | 'comments' | null>('ai'); // 'ai', 'comments', null
    
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'Hi! I am your AI writing companion. I can help you brainstorm, draft, or edit this document. What are we working on today?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Comments State
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [selectedTextForComment, setSelectedTextForComment] = useState('');

    // Modals
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    const debouncedContent = useDebounce(content, 1000);
    const debouncedTitle = useDebounce(title, 1000);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- Load Current Doc ---
    // In a real app with routing, we'd grab ID from URL. Here we rely on the draft mechanism primarily,
    // but try to find if this matches a saved doc.
    useEffect(() => {
        // Try to find the document in storage that matches current title/content to sync ID
        // This is imperfect for a demo but allows features to work
        const allDocs = documentService.getAll();
        const found = allDocs.find(d => d.templateId === ToolType.SMART_EDITOR && d.title === title && d.content === content);
        if (found) {
            setCurrentDoc(found);
            if (found.comments) setComments(found.comments);
        }
    }, []); // Run once on mount

    // --- Auto Save State Indicator ---
    useEffect(() => {
        if (debouncedContent || debouncedTitle) {
            setIsSaving(true);
            setTimeout(() => setIsSaving(false), 600);
        }
    }, [debouncedContent, debouncedTitle]);

    const handleSaveDocument = () => {
        setIsSaving(true);
        try {
            let docId = currentDoc?.id;
            
            if (docId) {
                // Update existing
                const existing = documentService.getById(docId);
                if (existing) {
                    const updated = {
                        ...existing,
                        title,
                        content,
                        lastModified: Date.now()
                    };
                    documentService.save(updated);
                    setCurrentDoc(updated);
                    showToast("Document updated", "success");
                }
            } else {
                // Create new
                const newDoc = documentService.create(title, content, ToolType.SMART_EDITOR);
                setCurrentDoc(newDoc);
                docId = newDoc.id;
                showToast("New document saved", "success");
            }
        } catch (error) {
            showToast("Failed to save", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Keyboard Shortcuts
    useKeyboardShortcuts([
        {
            combo: { key: 's', ctrlKey: true },
            handler: handleSaveDocument
        }
    ]);

    // --- Chat Logic ---
    useEffect(() => {
        if (activeSidebar === 'ai') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, activeSidebar]);

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput };
        setChatHistory(prev => [...prev, newUserMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const apiHistory = chatHistory.map(m => ({ role: m.role, text: m.text }));
            const response = await chatWithAI(apiHistory, newUserMsg.text, content);
            const newAiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response };
            setChatHistory(prev => [...prev, newAiMsg]);
        } catch (e) {
            showToast("Failed to get AI response", "error");
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleFactCheck = async () => {
        if (!content.trim()) return;
        
        setIsChatLoading(true);
        setActiveSidebar('ai');
        
        setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'user', text: "Fact check this document." }]);
        
        try {
            const result = await factCheck(content);
            setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result }]);
        } catch (e) {
            showToast("Fact check failed", "error");
        } finally {
            setIsChatLoading(false);
        }
    };

    // --- Comment Logic ---
    const handleAddComment = () => {
        if (!currentDoc) {
            showToast("Please save the document first to add comments.", "info");
            return;
        }
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            userId: user.email, // using email as ID for demo
            userName: user.name,
            userAvatar: user.avatar,
            content: newComment,
            timestamp: Date.now(),
            selectedText: selectedTextForComment,
            resolved: false
        };

        documentService.addComment(currentDoc.id, comment);
        
        // Update local state
        setComments(prev => [...prev, comment]);
        setNewComment('');
        setSelectedTextForComment('');
        showToast("Comment added", "success");
    };

    const handleResolveComment = (commentId: string) => {
        if (!currentDoc) return;
        documentService.resolveComment(currentDoc.id, commentId);
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: !c.resolved } : c));
    };

    const handleDeleteComment = (commentId: string) => {
         if (!currentDoc) return;
         documentService.deleteComment(currentDoc.id, commentId);
         setComments(prev => prev.filter(c => c.id !== commentId));
    };

    // Detect selection for commenting
    const handleSelectionCheck = () => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) {
            const text = sel.toString();
            if (text.length > 0) setSelectedTextForComment(text);
        }
    };

    const handleExport = (format: 'html' | 'txt') => {
        const element = document.createElement("a");
        let file: Blob;
        let name = title.replace(/\s+/g, '_');

        if (format === 'html') {
            file = new Blob([content], {type: 'text/html'});
            name += '.html';
        } else {
            // Simple strip tags for TXT
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const text = tempDiv.textContent || tempDiv.innerText || '';
            file = new Blob([text], {type: 'text/plain'});
            name += '.txt';
        }
        
        element.href = URL.createObjectURL(file);
        element.download = name;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const restoreVersion = (versionContent: string) => {
        if (confirm("Restore this version? Current content will be overwritten (but saved as a new version).")) {
            handleSaveDocument(); // Save current state before restoring
            setContent(versionContent);
            setIsHistoryOpen(false);
            showToast("Version restored", "success");
        }
    };

    return (
        <div className="flex h-full bg-slate-200 dark:bg-slate-950 overflow-hidden relative">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {/* Top Bar */}
                <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                             <Sparkles size={20} />
                        </div>
                        <input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent text-lg font-bold text-slate-900 dark:text-white outline-none placeholder-slate-400 w-full max-w-md"
                            placeholder="Document Title"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex text-xs text-slate-400 mr-2 items-center gap-1">
                            {isSaving ? <><Loader2 size={12} className="animate-spin"/> Saving...</> : <><Check size={12}/> Saved</>}
                        </div>
                        
                        <Button variant="ghost" size="sm" icon={Share2} onClick={() => { handleSaveDocument(); setIsShareOpen(true); }} title="Share">Share</Button>
                        <Button variant="ghost" size="sm" icon={History} onClick={() => { if(!currentDoc) handleSaveDocument(); setIsHistoryOpen(true); }} title="Version History" />
                        <Button variant="ghost" size="sm" icon={ShieldCheck} onClick={handleFactCheck} title="Verify Facts">Check</Button>
                        <Button variant="secondary" size="sm" icon={Save} onClick={handleSaveDocument}>Save</Button>
                        
                        {/* Export Dropdown Group */}
                        <div className="relative group">
                            <Button variant="secondary" size="sm" icon={Download}>Export</Button>
                            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-t-xl">HTML</button>
                                <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-b-xl">Plain Text</button>
                            </div>
                        </div>
                        
                        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

                        <button onClick={() => setActiveSidebar(activeSidebar === 'comments' ? null : 'comments')} className={`p-2 rounded-lg transition-colors relative ${activeSidebar === 'comments' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`} title="Comments">
                            <MessageCircle size={20} />
                            {comments.filter(c => !c.resolved).length > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                            )}
                        </button>

                        <button onClick={() => setActiveSidebar(activeSidebar === 'ai' ? null : 'ai')} className={`p-2 rounded-lg transition-colors ${activeSidebar === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`} title="AI Companion">
                            <Sidebar size={20} />
                        </button>
                    </div>
                </div>

                {/* Editor Canvas Container */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex justify-center bg-slate-200 dark:bg-slate-950" onClick={handleSelectionCheck}>
                    {/* A4 Page Container */}
                    <div className="w-full max-w-[210mm] bg-white dark:bg-slate-900 shadow-2xl mb-20 transition-all min-h-[297mm] relative">
                         {/* Selection Highlight for Commenting (Simple Visual) */}
                         {activeSidebar === 'comments' && selectedTextForComment && (
                            <div className="sticky top-0 left-0 w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-xs flex items-center justify-between z-10">
                                <span className="truncate max-w-[80%] font-medium text-yellow-800 dark:text-yellow-200">Commenting on: "{selectedTextForComment}"</span>
                                <button onClick={() => setSelectedTextForComment('')}><X size={14}/></button>
                            </div>
                        )}
                        <RichTextEditor 
                            value={content} 
                            onChange={setContent} 
                            className="min-h-[297mm] border-none"
                            placeholder="Start writing..."
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            {activeSidebar && (
                <div className="w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl absolute right-0 top-0 h-full lg:relative z-40 animate-in slide-in-from-right duration-300">
                    
                    {/* AI Sidebar Content */}
                    {activeSidebar === 'ai' && (
                        <>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageSquare size={16} className="text-indigo-600"/> AI Companion</h3>
                                <button onClick={() => setActiveSidebar(null)} className="lg:hidden"><X size={20} className="text-slate-400"/></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900">
                                {chatHistory.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <Loader2 size={16} className="animate-spin text-indigo-600" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                                <div className="relative">
                                    <textarea
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                        placeholder="Ask AI to help..."
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none max-h-32"
                                        rows={2}
                                    />
                                    <button onClick={handleSendMessage} disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Comments Sidebar Content */}
                    {activeSidebar === 'comments' && (
                        <>
                             <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle size={16} className="text-indigo-600"/> Comments</h3>
                                <button onClick={() => setActiveSidebar(null)} className="lg:hidden"><X size={20} className="text-slate-400"/></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900">
                                {!currentDoc ? (
                                    <div className="text-center py-10 text-slate-400 text-sm">Save document to enable comments.</div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 text-sm">No comments yet. Select text to add context.</div>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className={`bg-white dark:bg-slate-800 p-3 rounded-xl border ${comment.resolved ? 'border-slate-100 dark:border-slate-800 opacity-60' : 'border-slate-200 dark:border-slate-700'} shadow-sm`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                                        {comment.userName.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{comment.userName}</span>
                                                    <span className="text-xs text-slate-400">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                     <button onClick={() => handleResolveComment(comment.id)} className="p-1 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded" title={comment.resolved ? "Unresolve" : "Resolve"}>
                                                         <Check size={14} />
                                                     </button>
                                                     <button onClick={() => handleDeleteComment(comment.id)} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded" title="Delete">
                                                         <X size={14} />
                                                     </button>
                                                </div>
                                            </div>
                                            {comment.selectedText && (
                                                <div className="mb-2 pl-2 border-l-2 border-slate-300 dark:border-slate-600 text-xs text-slate-500 italic truncate">
                                                    "{comment.selectedText}"
                                                </div>
                                            )}
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                                {selectedTextForComment && (
                                    <div className="mb-2 text-xs text-slate-500 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                        <Quote size={12}/> Quoting selection
                                        <button onClick={() => setSelectedTextForComment('')} className="ml-auto"><X size={12}/></button>
                                    </div>
                                )}
                                <div className="relative">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                                        placeholder={currentDoc ? "Write a comment..." : "Save to comment"}
                                        disabled={!currentDoc}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        rows={2}
                                    />
                                    <button onClick={handleAddComment} disabled={!newComment.trim() || !currentDoc} className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* History Modal */}
            <Modal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                title="Version History"
            >
                <div className="space-y-4">
                    {!currentDoc?.versions || currentDoc.versions.length === 0 ? (
                        <div className="text-center text-slate-500 py-4">No previous versions found.</div>
                    ) : (
                        currentDoc.versions.map((ver, idx) => (
                            <div key={ver.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {new Date(ver.timestamp).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">{ver.changeDescription}</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    icon={RotateCcw} 
                                    onClick={() => restoreVersion(ver.content)}
                                >
                                    Restore
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            {/* Share Modal */}
            {currentDoc && (
                <ShareModal 
                    isOpen={isShareOpen}
                    onClose={() => setIsShareOpen(false)}
                    document={currentDoc}
                />
            )}
        </div>
    );
};

export default SmartEditor;
