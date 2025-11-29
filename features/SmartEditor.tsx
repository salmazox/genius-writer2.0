
import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, X, Send, Sparkles, Sidebar, Check, Loader2, Download, Save, ShieldCheck, History, RotateCcw, FileType
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { chatWithAI, factCheck } from '../services/gemini';
import { documentService } from '../services/documentService';
import { useToast } from '../contexts/ToastContext';
import { ToolType, SavedDocument } from '../types';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const SmartEditor: React.FC = () => {
    const { showToast } = useToast();
    
    // --- State ---
    const [content, setContent] = useLocalStorage<string>('smart_editor_content', '<h1>Untitled Document</h1><p>Start writing here...</p>');
    const [title, setTitle] = useLocalStorage<string>('smart_editor_title', 'Untitled Document');
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'Hi! I am your AI writing companion. I can help you brainstorm, draft, or edit this document. What are we working on today?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // History Modal State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [docHistory, setDocHistory] = useState<SavedDocument | null>(null);

    const debouncedContent = useDebounce(content, 1000);
    const debouncedTitle = useDebounce(title, 1000);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- Auto Save State Indicator ---
    useEffect(() => {
        if (debouncedContent || debouncedTitle) {
            // We don't auto-commit to persistence to avoid creating too many versions,
            // but we visually indicate "local" save is done via local storage hook.
            setIsSaving(true);
            setTimeout(() => setIsSaving(false), 600);
        }
    }, [debouncedContent, debouncedTitle]);

    const handleSaveDocument = () => {
        setIsSaving(true);
        try {
            if (currentDocId) {
                // Update existing
                const existing = documentService.getById(currentDocId);
                if (existing) {
                    documentService.save({
                        ...existing,
                        title,
                        content,
                        lastModified: Date.now()
                    });
                    showToast("Document updated", "success");
                } else {
                    // Fallback if ID lost
                    const newDoc = documentService.create(title, content, ToolType.SMART_EDITOR);
                    setCurrentDocId(newDoc.id);
                    showToast("Document saved", "success");
                }
            } else {
                // Create new
                const newDoc = documentService.create(title, content, ToolType.SMART_EDITOR);
                setCurrentDocId(newDoc.id);
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
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

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
        if(!isSidebarOpen) setIsSidebarOpen(true);
        
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

    const openHistory = () => {
        if (!currentDocId) {
            showToast("Save the document first to see history.", "info");
            return;
        }
        const doc = documentService.getById(currentDocId);
        if (doc) {
            setDocHistory(doc);
            setIsHistoryOpen(true);
        }
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
                        
                        <Button variant="ghost" size="sm" icon={History} onClick={openHistory} title="Version History" />
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

                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`} title="Toggle AI Companion">
                            <Sidebar size={20} />
                        </button>
                    </div>
                </div>

                {/* Editor Canvas Container */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex justify-center bg-slate-200 dark:bg-slate-950" onClick={() => {}}>
                    {/* A4 Page Container */}
                    <div className="w-full max-w-[210mm] bg-white dark:bg-slate-900 shadow-2xl mb-20 transition-all min-h-[297mm]">
                        <RichTextEditor 
                            value={content} 
                            onChange={setContent} 
                            className="min-h-[297mm] border-none"
                            placeholder="Start writing..."
                        />
                    </div>
                </div>
            </div>

            {/* AI Sidebar */}
            {isSidebarOpen && (
                <div className="w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl absolute right-0 top-0 h-full lg:relative z-40">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageSquare size={16} className="text-indigo-600"/> AI Companion</h3>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X size={20} className="text-slate-400"/></button>
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
                </div>
            )}

            {/* History Modal */}
            <Modal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                title="Version History"
            >
                <div className="space-y-4">
                    {!docHistory?.versions || docHistory.versions.length === 0 ? (
                        <div className="text-center text-slate-500 py-4">No previous versions found.</div>
                    ) : (
                        docHistory.versions.map((ver, idx) => (
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
        </div>
    );
};

export default SmartEditor;
