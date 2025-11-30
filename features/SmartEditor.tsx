
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    MessageSquare, X, Send, Sparkles, Sidebar, Check, Loader2, Download, Save, ShieldCheck, History, RotateCcw, MessageCircle, Share2, Quote, Lock, Search, AlertCircle, ArrowLeft, FileType, Volume2, Square
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ShareModal } from '../components/ShareModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { chatWithAI, factCheck, generateSpeech } from '../services/gemini';
import { documentService } from '../services/documentService';
import { useToast } from '../contexts/ToastContext';
import { ToolType, SavedDocument, Comment } from '../types';
import { useUser } from '../contexts/UserContext';
import { Watermark } from '../components/Watermark';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

const SmartEditor: React.FC = () => {
    const { showToast } = useToast();
    const { user } = useUser();
    const { t } = useThemeLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const copyToClipboard = useCopyToClipboard();
    
    // --- State ---
    // Initialize with empty string for cleaner word count/placeholder logic
    const [content, setContent] = useLocalStorage<string>('smart_editor_content', '');
    const [title, setTitle] = useLocalStorage<string>('smart_editor_title', 'Untitled Document');
    const [currentDoc, setCurrentDoc] = useState<SavedDocument | null>(null);
    const [activeSidebar, setActiveSidebar] = useState<'ai' | 'comments' | 'seo' | null>(null); // Default closed
    
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

    // SEO State
    const [seoKeywords, setSeoKeywords] = useState('');
    
    // TTS State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Modals
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    const debouncedContent = useDebounce(content, 1000);
    const debouncedTitle = useDebounce(title, 1000);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const isPro = user.plan !== 'free';

    // Migration Effect for old default content
    useEffect(() => {
        if (content === '<h1>Untitled Document</h1><p>Start writing here...</p>') {
            setContent('');
        }
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // --- Load Current Doc ---
    useEffect(() => {
        // Try to find the document in storage that matches current title/content to sync ID
        const allDocs = documentService.getAll();
        const found = allDocs.find(d => d.templateId === ToolType.SMART_EDITOR && d.title === title && d.content === content);
        if (found) {
            setCurrentDoc(found);
            if (found.comments) setComments(found.comments);
        }
    }, []); 

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
                    showToast(t('dashboard.toasts.saved'), "success");
                }
            } else {
                // Create new
                const newDoc = documentService.create(title, content, ToolType.SMART_EDITOR);
                setCurrentDoc(newDoc);
                docId = newDoc.id;
                showToast(t('dashboard.toasts.saved'), "success");
            }
        } catch (error) {
            showToast(t('dashboard.toasts.error'), "error");
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

    const handleBack = () => {
        setSearchParams({ tab: 'library' });
    };

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
            showToast(t('dashboard.toasts.error'), "error");
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
            showToast(t('dashboard.toasts.error'), "error");
        } finally {
            setIsChatLoading(false);
        }
    };

    // --- Comment Logic ---
    const handleAddComment = () => {
        if (!currentDoc) {
            showToast(t('dashboard.smart.saveFirst'), "info");
            return;
        }
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            userId: user.email, 
            userName: user.name,
            userAvatar: user.avatar,
            content: newComment,
            timestamp: Date.now(),
            selectedText: selectedTextForComment,
            resolved: false
        };

        documentService.addComment(currentDoc.id, comment);
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

    const handleSelectionCheck = () => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) {
            const text = sel.toString();
            if (text.length > 0) setSelectedTextForComment(text);
        }
    };

    // --- Audio Logic ---
    const stopAudio = () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    };

    const handleListen = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        if (!content) return;
        
        // Strip HTML for TTS
        const plainText = content.replace(/<[^>]*>/g, ' ').replace(/[#*_`]/g, '');
        if (!plainText.trim()) return;

        setIsGeneratingAudio(true);
        try {
            const buffer = await generateSpeech(plainText);
            const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = ctx;

            const audioBuffer = await ctx.decodeAudioData(buffer);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => setIsPlaying(false);
            source.start();
            audioSourceRef.current = source;
            setIsPlaying(true);
        } catch (e) {
            showToast("Failed to play audio", "error");
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    // --- SEO Logic ---
    const seoAnalysis = useMemo(() => {
        if (!seoKeywords.trim()) return [];
        const text = content.replace(/<[^>]*>/g, '').toLowerCase();
        return seoKeywords.split(',').map(k => k.trim()).filter(Boolean).map(keyword => {
            const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
            const matches = text.match(regex);
            const count = matches ? matches.length : 0;
            return { keyword, count };
        });
    }, [content, seoKeywords]);

    const handleExport = (format: 'html' | 'txt' | 'doc') => {
        if (!isPro) {
            showToast("Upgrade to Pro to export files.", "error");
            return;
        }

        const element = document.createElement("a");
        let file: Blob;
        let name = title.replace(/\s+/g, '_');

        if (format === 'html') {
            // Enhanced HTML Export with Tailwind CDN and Styles
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .prose h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; }
        .prose h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .prose p { margin-bottom: 1rem; line-height: 1.75; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; font-style: italic; }
    </style>
</head>
<body class="bg-white text-slate-900 p-8 md:p-12 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 border-b pb-4">${title}</h1>
    <div class="prose max-w-none text-lg">
        ${content}
    </div>
</body>
</html>`;
            file = new Blob([htmlContent], {type: 'text/html'});
            name += '.html';
        } else if (format === 'doc') {
             // Basic Word Export wrapper
             const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>" + title + "</title></head><body>";
             const footer = "</body></html>";
             const sourceHTML = header + content + footer;
             file = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
             name += '.doc';
        } else {
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
            showToast(t('dashboard.toasts.restored'), "success");
        }
    };

    return (
        <div className="flex h-full bg-slate-200 dark:bg-slate-950 overflow-hidden relative">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {/* Top Bar */}
                <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 lg:px-8 shrink-0 z-30 shadow-sm gap-2">
                    
                    {/* Left: Back (Mobile) & Title */}
                    <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
                        <button onClick={handleBack} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 -ml-2">
                            <ArrowLeft size={20} />
                        </button>
                        
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 hidden sm:block">
                             <Sparkles size={20} />
                        </div>
                        <input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            aria-label="Document Title"
                            className="bg-transparent text-base lg:text-lg font-bold text-slate-900 dark:text-white outline-none placeholder-slate-400 w-full max-w-[150px] sm:max-w-md truncate"
                            placeholder="Document Title"
                        />
                    </div>
                    
                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="hidden md:flex text-xs text-slate-400 mr-2 items-center gap-1">
                            {isSaving ? <><Loader2 size={12} className="animate-spin"/> {t('dashboard.smart.saving')}</> : <><Check size={12}/> {t('dashboard.smart.saved')}</>}
                        </div>
                        
                        {/* TTS Button */}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleListen} 
                            title={isPlaying ? "Stop" : "Read Aloud"} 
                            icon={isGeneratingAudio ? Sparkles : isPlaying ? Square : Volume2} 
                            className={`hidden sm:flex ${isPlaying ? "text-red-500 animate-pulse" : ""}`}
                        />

                        <Button variant="ghost" size="sm" icon={Share2} onClick={() => { handleSaveDocument(); setIsShareOpen(true); }} className="hidden sm:flex">
                            <span className="hidden md:inline">{t('dashboard.smart.share')}</span>
                        </Button>
                        <Button variant="ghost" size="sm" icon={History} onClick={() => { if(!currentDoc) handleSaveDocument(); setIsHistoryOpen(true); }} className="hidden sm:flex" />
                        
                        <Button variant="secondary" size="sm" icon={Save} onClick={handleSaveDocument} aria-label={t('dashboard.smart.save')} className="hidden sm:flex">
                            <span className="hidden md:inline">{t('dashboard.smart.save')}</span>
                        </Button>
                        
                        {/* Export Dropdown Group - Visible on all screens but compact */}
                        <div className="relative group">
                            <Button variant={isPro ? "secondary" : "ghost"} size="sm" icon={isPro ? Download : Lock} aria-label="Export Menu">
                                <span className="hidden md:inline">{t('dashboard.smart.export')}</span>
                            </Button>
                            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-t-xl">HTML</button>
                                <button onClick={() => handleExport('doc')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Word Doc</button>
                                <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-b-xl">Plain Text</button>
                            </div>
                        </div>
                        
                        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

                        {/* Sidebar Toggles - Always visible for quick access */}
                        <button 
                            onClick={() => setActiveSidebar(activeSidebar === 'seo' ? null : 'seo')} 
                            className={`p-2 rounded-lg transition-colors relative ${activeSidebar === 'seo' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`} 
                            title="SEO Analysis"
                        >
                            <Search size={20} />
                        </button>

                        <button 
                            onClick={() => setActiveSidebar(activeSidebar === 'comments' ? null : 'comments')} 
                            className={`p-2 rounded-lg transition-colors relative ${activeSidebar === 'comments' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`} 
                            title={t('dashboard.smart.comments')}
                        >
                            <MessageCircle size={20} />
                            {comments.filter(c => !c.resolved).length > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                            )}
                        </button>

                        <button 
                            onClick={() => setActiveSidebar(activeSidebar === 'ai' ? null : 'ai')} 
                            className={`p-2 rounded-lg transition-colors ${activeSidebar === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`} 
                            title={t('dashboard.smart.aiCompanion')}
                        >
                            <Sidebar size={20} />
                        </button>
                    </div>
                </div>

                {/* Editor Canvas Container */}
                <div className="flex-1 overflow-y-auto p-2 lg:p-8 flex justify-center bg-slate-200 dark:bg-slate-950" onClick={handleSelectionCheck}>
                    {/* A4 Page Container */}
                    <div className="w-full max-w-[210mm] bg-white dark:bg-slate-900 shadow-2xl mb-20 transition-all min-h-[297mm] relative">
                         {/* Selection Highlight for Commenting (Simple Visual) */}
                         {activeSidebar === 'comments' && selectedTextForComment && (
                            <div className="sticky top-0 left-0 w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-xs flex items-center justify-between z-10">
                                <span className="truncate max-w-[80%] font-medium text-yellow-800 dark:text-yellow-200">Commenting on: "{selectedTextForComment}"</span>
                                <button onClick={() => setSelectedTextForComment('')}><X size={14}/></button>
                            </div>
                        )}
                        {!isPro && <Watermark className="z-0" />}
                        <RichTextEditor 
                            value={content} 
                            onChange={setContent} 
                            className="min-h-[297mm] border-none z-10 relative bg-transparent"
                            placeholder={t('dashboard.placeholder')}
                            showStats={true}
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
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageSquare size={16} className="text-indigo-600"/> {t('dashboard.smart.aiCompanion')}</h3>
                                <button onClick={() => setActiveSidebar(null)} className="lg:hidden" aria-label="Close Sidebar"><X size={20} className="text-slate-400"/></button>
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
                                        placeholder={t('dashboard.smart.askAi')}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none max-h-32"
                                        rows={2}
                                        aria-label="AI Chat Input"
                                    />
                                    <button onClick={handleSendMessage} disabled={!chatInput.trim() || isChatLoading} aria-label="Send Message" className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* SEO Sidebar Content */}
                    {activeSidebar === 'seo' && (
                        <>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Search size={16} className="text-indigo-600"/> SEO Analysis</h3>
                                <button onClick={() => setActiveSidebar(null)} className="lg:hidden" aria-label="Close Sidebar"><X size={20} className="text-slate-400"/></button>
                            </div>
                            
                            <div className="p-4 flex-1 overflow-y-auto">
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Keywords</label>
                                    <textarea 
                                        value={seoKeywords}
                                        onChange={(e) => setSeoKeywords(e.target.value)}
                                        placeholder="Enter keywords (comma separated)..."
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Real-time usage tracking</p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Keyword Density</h4>
                                    {seoAnalysis.length === 0 ? (
                                        <div className="text-center py-4 text-slate-400 text-sm">
                                            No keywords defined.
                                        </div>
                                    ) : (
                                        seoAnalysis.map(({ keyword, count }) => (
                                            <div key={keyword} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{keyword}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${count === 0 ? 'text-red-500' : count > 5 ? 'text-orange-500' : 'text-green-500'}`}>
                                                        {count}x
                                                    </span>
                                                    {count === 0 && <AlertCircle size={14} className="text-red-500"/>}
                                                    {count > 0 && count <= 5 && <Check size={14} className="text-green-500"/>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Comments Sidebar Content */}
                    {activeSidebar === 'comments' && (
                        <>
                             <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle size={16} className="text-indigo-600"/> {t('dashboard.smart.comments')}</h3>
                                <button onClick={() => setActiveSidebar(null)} className="lg:hidden" aria-label="Close Sidebar"><X size={20} className="text-slate-400"/></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900">
                                {!currentDoc ? (
                                    <div className="text-center py-10 text-slate-400 text-sm">{t('dashboard.smart.saveFirst')}</div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 text-sm">{t('dashboard.smart.noComments')}</div>
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
                                                     <button onClick={() => handleResolveComment(comment.id)} className="p-1 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded" title={comment.resolved ? "Unresolve" : "Resolve"} aria-label={comment.resolved ? "Unresolve comment" : "Resolve comment"}>
                                                         <Check size={14} />
                                                     </button>
                                                     <button onClick={() => handleDeleteComment(comment.id)} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded" title="Delete" aria-label="Delete comment">
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
                                        <button onClick={() => setSelectedTextForComment('')} className="ml-auto" aria-label="Clear quote"><X size={12}/></button>
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
                                        aria-label="Comment Input"
                                    />
                                    <button onClick={handleAddComment} disabled={!newComment.trim() || !currentDoc} aria-label="Send Comment" className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
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
                title={t('dashboard.smart.history')}
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
                                    {t('dashboard.restore')}
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
