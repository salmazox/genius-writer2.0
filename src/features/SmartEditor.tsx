import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    MessageSquare, X, Send, Sparkles, Sidebar, Check, Loader2, Download, Save, ShieldCheck, History, RotateCcw, MessageCircle, Share2, Quote, Lock, Search, AlertCircle, ArrowLeft, FileType, Volume2, Square, Copy, Shield, Clock, BookOpen, List, FileText, Palette
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ShareModal } from '../components/ShareModal';
import CollaborationShareModal from '../components/CollaborationShareModal';
import CommentPanel from '../components/CommentPanel';
import ActivityFeed from '../components/ActivityFeed';
import DocumentOutline from '../components/DocumentOutline';
import ChapterManager from '../components/ChapterManager';
import TableOfContents from '../components/TableOfContents';
import BrandKitManager from '../components/BrandKitManager';
import BrandConsistencyPanel from '../components/BrandConsistencyPanel';
import PlagiarismPanel from '../components/PlagiarismPanel';
import SEOPanel from '../components/SEOPanel';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { chatWithAI, factCheck, generateSpeech } from '../services/gemini';
import { documentService } from '../services/documentService';
import { logActivity } from '../services/collaboration';
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
    const [activeSidebar, setActiveSidebar] = useState<'ai' | 'comments' | 'seo' | 'plagiarism' | 'activity' | 'outline' | 'chapters' | 'toc' | 'brandkit' | 'brandcheck' | null>(null); // Default closed

    // Collaboration state
    const [showCollaborationShare, setShowCollaborationShare] = useState(false);
    const documentId = currentDoc?.id || `doc_${Date.now()}`; // Use current doc ID or generate temporary ID

    // Mock user data for collaboration (replace with real auth later)
    const currentUser = {
        id: user.email || 'user_temp',
        name: user.name || 'Guest User',
        email: user.email || 'guest@example.com',
        avatar: user.avatar
    };
    
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
            const isNewDoc = !docId;

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

                    // Log activity
                    logActivity(docId, currentUser.id, currentUser.name, 'edit', 'Updated document content');
                }
            } else {
                // Create new
                const newDoc = documentService.create(title, content, ToolType.SMART_EDITOR);
                setCurrentDoc(newDoc);
                docId = newDoc.id;
                showToast(t('dashboard.toasts.saved'), "success");

                // Log activity
                logActivity(newDoc.id, currentUser.id, currentUser.name, 'create', `Created document "${title}"`);
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
                    <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
                        <div className="hidden md:flex text-xs text-slate-400 mr-2 items-center gap-1">
                            {isSaving ? <><Loader2 size={12} className="animate-spin"/> {t('dashboard.smart.saving')}</> : <><Check size={12}/> {t('dashboard.smart.saved')}</>}
                        </div>

                        {/* Mobile: Only show Save + AI */}
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={Save}
                            onClick={handleSaveDocument}
                            aria-label={t('dashboard.smart.save')}
                            className="lg:hidden"
                        />

                        <button
                            onClick={() => setActiveSidebar(activeSidebar === 'ai' ? null : 'ai')}
                            className={`lg:hidden p-1.5 sm:p-2 rounded-lg transition-colors ${activeSidebar === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                            title={t('dashboard.smart.aiCompanion')}
                        >
                            <Sidebar size={18} />
                        </button>

                        {/* Desktop: Show all tools organized */}
                        <div className="hidden lg:flex items-center gap-1">
                            {/* TTS Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleListen}
                                title={isPlaying ? "Stop" : "Read Aloud"}
                                icon={isGeneratingAudio ? Sparkles : isPlaying ? Square : Volume2}
                                className={isPlaying ? "text-red-500 animate-pulse" : ""}
                            />

                            <Button variant="ghost" size="sm" icon={Share2} onClick={() => { handleSaveDocument(); setIsShareOpen(true); }}>
                                <span className="hidden xl:inline">{t('dashboard.smart.share')}</span>
                            </Button>
                            <Button variant="ghost" size="sm" icon={History} onClick={() => { if(!currentDoc) handleSaveDocument(); setIsHistoryOpen(true); }} />

                            <Button variant="secondary" size="sm" icon={Save} onClick={handleSaveDocument} aria-label={t('dashboard.smart.save')}>
                                <span className="hidden xl:inline">{t('dashboard.smart.save')}</span>
                            </Button>

                            {/* Export Dropdown Group */}
                            <div className="relative group">
                                <Button variant={isPro ? "secondary" : "ghost"} size="sm" icon={isPro ? Download : Lock} aria-label="Export Menu">
                                    <span className="hidden xl:inline">{t('dashboard.smart.export')}</span>
                                </Button>
                                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-t-xl">HTML</button>
                                    <button onClick={() => handleExport('doc')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Word Doc</button>
                                    <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-b-xl">Plain Text</button>
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

                            {/* Brand Kit Tools */}
                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'brandkit' ? null : 'brandkit')}
                                className={`p-2 rounded-lg transition-colors ${activeSidebar === 'brandkit' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Brand Kit"
                            >
                                <Palette size={18} />
                            </button>

                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'brandcheck' ? null : 'brandcheck')}
                                className={`p-2 rounded-lg transition-colors ${activeSidebar === 'brandcheck' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Brand Consistency"
                            >
                                <ShieldCheck size={18} />
                            </button>

                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

                            {/* Long-Form Writing Tools */}
                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'chapters' ? null : 'chapters')}
                                className={`p-2 rounded-lg transition-colors ${activeSidebar === 'chapters' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Chapters"
                            >
                                <BookOpen size={18} />
                            </button>

                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'outline' ? null : 'outline')}
                                className={`p-2 rounded-lg transition-colors ${activeSidebar === 'outline' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Document Outline"
                            >
                                <FileText size={18} />
                            </button>

                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'toc' ? null : 'toc')}
                                className={`p-2 rounded-lg transition-colors ${activeSidebar === 'toc' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Table of Contents"
                            >
                                <List size={18} />
                            </button>

                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

                            {/* Sidebar Toggles */}
                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'plagiarism' ? null : 'plagiarism')}
                                className={`p-2 rounded-lg transition-colors relative ${activeSidebar === 'plagiarism' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Originality Check"
                            >
                                <Shield size={18} />
                            </button>

                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'seo' ? null : 'seo')}
                                className={`p-2 rounded-lg transition-colors relative ${activeSidebar === 'seo' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="SEO Analysis"
                            >
                                <Search size={18} />
                            </button>

                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'comments' ? null : 'comments')}
                                className={`p-2 rounded-lg transition-colors relative ${activeSidebar === 'comments' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Comments"
                            >
                                <MessageCircle size={18} />
                            </button>

                            <button
                                onClick={() => {
                                    handleSaveDocument();
                                    setShowCollaborationShare(true);
                                }}
                                className="p-2 rounded-lg transition-colors text-slate-500 hover:bg-slate-100"
                                title="Share Document"
                            >
                                <Share2 size={18} />
                            </button>

                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'activity' ? null : 'activity')}
                                className={`p-2 rounded-lg transition-colors ${activeSidebar === 'activity' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="Activity Feed"
                            >
                                <Clock size={18} />
                            </button>

                            <button
                                onClick={() => setActiveSidebar(activeSidebar === 'ai' ? null : 'ai')}
                                className={`p-2 rounded-lg transition-colors ${activeSidebar === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title={t('dashboard.smart.aiCompanion')}
                            >
                                <Sidebar size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Editor Canvas Container */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex justify-center bg-slate-200 dark:bg-slate-950" onClick={handleSelectionCheck}>
                    {/* A4 Page Container */}
                    <div className="w-full max-w-[210mm] bg-white dark:bg-slate-900 shadow-2xl mb-20 transition-all min-h-[297mm] relative overflow-hidden">
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
                <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl fixed lg:relative right-0 top-0 h-full z-50 lg:z-40 animate-in slide-in-from-right duration-300">
                    
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

                    {/* Plagiarism Sidebar Content */}
                    {activeSidebar === 'plagiarism' && (
                        <>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Shield size={16} className="text-indigo-600"/> Originality Check</h3>
                                <button onClick={() => setActiveSidebar(null)} className="lg:hidden" aria-label="Close Sidebar"><X size={20} className="text-slate-400"/></button>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto">
                                <PlagiarismPanel
                                    content={content}
                                    toolType={ToolType.SMART_EDITOR}
                                />
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
                                <SEOPanel
                                    content={content}
                                    title={title}
                                />
                            </div>
                        </>
                    )}

                    {/* Comments Sidebar Content */}
                    {activeSidebar === 'comments' && (
                        <div className="h-full overflow-hidden">
                            <CommentPanel
                                documentId={documentId}
                                currentUserId={currentUser.id}
                                currentUserName={currentUser.name}
                                currentUserAvatar={currentUser.avatar}
                                onClose={() => setActiveSidebar(null)}
                            />
                        </div>
                    )}

                    {/* Activity Feed Sidebar Content */}
                    {activeSidebar === 'activity' && (
                        <div className="h-full overflow-hidden">
                            <ActivityFeed
                                documentId={documentId}
                                onClose={() => setActiveSidebar(null)}
                            />
                        </div>
                    )}

                    {/* Chapter Manager Sidebar Content */}
                    {activeSidebar === 'chapters' && (
                        <div className="h-full overflow-hidden">
                            <ChapterManager
                                documentId={documentId}
                                onClose={() => setActiveSidebar(null)}
                            />
                        </div>
                    )}

                    {/* Document Outline Sidebar Content */}
                    {activeSidebar === 'outline' && (
                        <div className="h-full overflow-hidden">
                            <DocumentOutline
                                documentId={documentId}
                                onClose={() => setActiveSidebar(null)}
                            />
                        </div>
                    )}

                    {/* Table of Contents Sidebar Content */}
                    {activeSidebar === 'toc' && (
                        <div className="h-full overflow-hidden">
                            <TableOfContents
                                content={content}
                                onClose={() => setActiveSidebar(null)}
                            />
                        </div>
                    )}

                    {/* Brand Kit Manager Sidebar Content */}
                    {activeSidebar === 'brandkit' && (
                        <div className="h-full overflow-hidden">
                            <BrandKitManager
                                onClose={() => setActiveSidebar(null)}
                            />
                        </div>
                    )}

                    {/* Brand Consistency Panel Sidebar Content */}
                    {activeSidebar === 'brandcheck' && (
                        <div className="h-full overflow-hidden">
                            <BrandConsistencyPanel
                                content={content}
                                onClose={() => setActiveSidebar(null)}
                            />
                        </div>
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

            {/* Share Modal (Email-based) */}
            {currentDoc && (
                <ShareModal
                    isOpen={isShareOpen}
                    onClose={() => setIsShareOpen(false)}
                    document={currentDoc}
                />
            )}

            {/* Collaboration Share Modal (Token-based) */}
            <CollaborationShareModal
                documentId={documentId}
                currentUserId={currentUser.id}
                isOpen={showCollaborationShare}
                onClose={() => setShowCollaborationShare(false)}
            />
        </div>
    );
};

export default SmartEditor;