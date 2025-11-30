
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Copy, FileText, Layout, Eye, Download, FileType, Sparkles, Save, Check, Code, Settings2, Tag, Lock, Image as ImageIcon, Palette, PenTool, Mail, Volume2, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ToolConfig, ToolType } from '../types';
import { generateContent, generateContentStream, generateSpeech } from '../services/gemini';
import { documentService } from '../services/documentService';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Forms';
import { Skeleton } from '../components/ui/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useSwipe } from '../hooks/useSwipe';
import { BrandVoiceManager } from './BrandVoiceManager';
import { Watermark } from '../components/Watermark';
import { sanitizeHtml } from '../utils/security';

declare global {
  interface Window {
    html2pdf: any;
  }
}

interface GenericToolProps {
    tool: ToolConfig;
}

const ACCENT_COLORS = [
    { name: 'Indigo', value: '#4f46e5', twText: 'text-indigo-600', twBorder: 'border-indigo-600', twBg: 'bg-indigo-600', twRing: 'ring-indigo-600' },
    { name: 'Emerald', value: '#059669', twText: 'text-emerald-600', twBorder: 'border-emerald-600', twBg: 'bg-emerald-600', twRing: 'ring-emerald-600' },
    { name: 'Blue', value: '#2563eb', twText: 'text-blue-600', twBorder: 'border-blue-600', twBg: 'bg-blue-600', twRing: 'ring-blue-600' },
    { name: 'Rose', value: '#e11d48', twText: 'text-rose-600', twBorder: 'border-rose-600', twBg: 'bg-rose-600', twRing: 'ring-rose-600' },
    { name: 'Amber', value: '#d97706', twText: 'text-amber-600', twBorder: 'border-amber-600', twBg: 'bg-amber-600', twRing: 'ring-amber-600' },
    { name: 'Slate', value: '#475569', twText: 'text-slate-600', twBorder: 'border-slate-600', twBg: 'bg-slate-600', twRing: 'ring-slate-600' },
];

const GenericTool: React.FC<GenericToolProps> = ({ tool }) => {
    const { t } = useThemeLanguage();
    const { showToast } = useToast();
    const { brandVoices, selectedVoiceId, setSelectedVoiceId, user } = useUser();
    
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [documentContent, setDocumentContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [mobileTab, setMobileTab] = useState<'input' | 'result'>('input');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [showVoiceManager, setShowVoiceManager] = useState(false);
    
    // TTS State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    // Design Template State
    const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
    const [accentColor, setAccentColor] = useState<string>('#4f46e5');
    
    // Tagging state
    const [tags, setTags] = useState<string>('');
    
    const previewRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce state for auto-save
    const debouncedForm = useDebounce(formValues, 1000);
    const debouncedContent = useDebounce(documentContent, 1000);
    
    const isPro = user.plan !== 'free';
    const isImageTool = tool.id === ToolType.IMAGE_GEN;
    const hasTemplates = [ToolType.INVOICE_GEN, ToolType.CONTRACT_GEN, ToolType.EMAIL_TEMPLATE].includes(tool.id);
    const isHtmlOutput = hasTemplates;

    // Swipe gestures
    const swipeHandlers = useSwipe({
        onSwipeLeft: () => setMobileTab('result'),
        onSwipeRight: () => setMobileTab('input'),
        threshold: 75
    });

    // Stats
    const stats = useMemo(() => {
        if (isImageTool) return null;
        const text = documentContent.replace(/<[^>]*>/g, '');
        return {
            words: text.trim() ? text.trim().split(/\s+/).length : 0,
            chars: text.length,
            readTime: Math.ceil(text.trim().split(/\s+/).length / 200)
        };
    }, [documentContent, isImageTool]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Load draft on mount/tool change
    useEffect(() => {
        const loadDraft = () => {
            try {
                const saved = localStorage.getItem(`draft_${tool.id}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setFormValues(parsed.formValues || {});
                    setDocumentContent(parsed.documentContent || '');
                    if (parsed.template) setTemplate(parsed.template);
                    if (parsed.accentColor) setAccentColor(parsed.accentColor);
                } else {
                    setFormValues({});
                    setDocumentContent('');
                    setTags('');
                    setTemplate('modern');
                    setAccentColor('#4f46e5');
                }
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        };

        loadDraft();
        setMobileTab('input');
        if (abortControllerRef.current) abortControllerRef.current.abort();
        stopAudio(); // Stop any playing audio on tool switch

    }, [tool.id]);

    // Auto-save effect
    useEffect(() => {
        if (Object.keys(debouncedForm).length === 0 && !debouncedContent) return;

        const saveDraft = () => {
            setIsAutoSaving(true);
            localStorage.setItem(`draft_${tool.id}`, JSON.stringify({
                formValues: debouncedForm,
                documentContent: debouncedContent,
                template: template,
                accentColor: accentColor,
                lastSaved: Date.now()
            }));
            setTimeout(() => setIsAutoSaving(false), 500);
        };

        saveDraft();
    }, [debouncedForm, debouncedContent, template, accentColor, tool.id]);

    const handleGenerate = async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        // Clear content if not streaming images (images replace all at once)
        if (!isImageTool) setDocumentContent('');
        
        const selectedVoice = brandVoices.find(v => v.id === selectedVoiceId);
        
        const inputsWithTheme = {
            ...formValues,
            accentColor, 
            template
        };

        try {
            if (isImageTool) {
                // Image Gen uses normal generateContent
                const result = await generateContent(
                    tool.id, 
                    inputsWithTheme, 
                    selectedVoice ? `${selectedVoice.name}: ${selectedVoice.description}` : undefined,
                    controller.signal
                );
                setDocumentContent(result);
                showToast("Image generated successfully", 'success');
            } else {
                // Text tools use Streaming for faster perception
                await generateContentStream(
                    tool.id,
                    inputsWithTheme,
                    (chunk) => {
                        // Clean Markdown code blocks if they slip through
                        let cleaned = chunk.replace(/```html/g, '').replace(/```/g, '');
                        setDocumentContent(cleaned);
                    },
                    selectedVoice ? `${selectedVoice.name}: ${selectedVoice.description}` : undefined,
                    controller.signal
                );
                showToast(t('dashboard.toasts.generated'), 'success');
            }
            setMobileTab('result');
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error(e);
                const msg = e.message || t('dashboard.toasts.error');
                showToast(msg, 'error');
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        }
    };

    const handleSaveToDocuments = () => {
        if (!documentContent.trim()) {
            showToast("Nothing to save!", "error");
            return;
        }

        // Generate a default title based on tool + date
        const defaultTitle = `${tool.name} - ${new Date().toLocaleDateString()}`;
        const titleCandidate = formValues['topic'] || formValues['productName'] || formValues['prompt'] || defaultTitle;
        
        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

        documentService.create(titleCandidate, documentContent, tool.id, undefined, tagList);
        showToast("Saved to My Documents", "success");
    };

    const handleCopy = () => {
        if (!documentContent) return;
        navigator.clipboard.writeText(documentContent);
        showToast("Copied content", 'info');
    };

    const handleCopyHtml = () => {
        if (!previewRef.current) return;
        const html = previewRef.current.innerHTML;
        navigator.clipboard.writeText(html);
        showToast("Copied HTML Code", 'info');
    }

    const handleExportWord = () => {
        if (!isPro) {
            showToast("Upgrade to Pro to export.", "error");
            return;
        }
        if (!documentContent) { showToast("No content to export", "error"); return; }
        const element = previewRef.current;
        if (!element) return;

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Document</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + element.innerHTML + footer;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `${tool.name.replace(/\s+/g, '_')}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
        showToast("Exported to Word", "success");
    };

    const handleDownloadPDF = () => {
        if (!isPro) {
            showToast("Upgrade to Pro to export.", "error");
            return;
        }
        if (!documentContent) { showToast("No content to export", "error"); return; }
        const element = previewRef.current;
        if (!element) return;
        
        const elementId = hasTemplates ? 'template-wrapper' : null;
        const sourceElement = elementId ? document.getElementById(elementId) || element : element;

        const opt = {
            margin: 0.5,
            filename: `${tool.name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        if (window.html2pdf) {
            showToast("Generating PDF...", "info");
            window.html2pdf().set(opt).from(sourceElement).save();
        } else {
            showToast("PDF Library not loaded.", "error");
        }
    };

    const handleDownloadImage = () => {
        if (!documentContent || !documentContent.startsWith('data:image')) {
            showToast("No valid image to download", "error");
            return;
        }
        const link = document.createElement('a');
        link.href = documentContent;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Image downloaded", "success");
    };

    const insertSignature = () => {
        const signatureBlock = `<div style="margin-top: 40px; display: flex; gap: 40px;"><div style="border-top: 1px solid currentColor; width: 200px; padding-top: 8px;">Signature (Provider)</div><div style="border-top: 1px solid currentColor; width: 200px; padding-top: 8px;">Signature (Client)</div></div>`;
        setDocumentContent(prev => prev + signatureBlock);
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

        if (!documentContent) return;
        
        // Strip markdown/HTML for TTS
        const plainText = documentContent.replace(/<[^>]*>/g, ' ').replace(/[#*_`]/g, '');
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

    // --- Template Styles ---
    const getTemplateStyles = () => {
        // We inject a <style> tag to style the Inner HTML generated by AI.
        // This is robust against whatever structure the AI returns, assuming it uses standard tags.
        
        const modernStyles = `
            #template-wrapper { font-family: 'Inter', sans-serif; color: #1e293b; padding: 3rem; }
            #template-wrapper h1 { 
                font-size: 2.5rem; 
                font-weight: 800; 
                text-transform: uppercase; 
                color: var(--accent-color); 
                margin-bottom: 2rem; 
                border-bottom: 4px solid var(--accent-color);
                padding-bottom: 0.5rem;
                letter-spacing: -0.05em;
            }
            #template-wrapper h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; color: #334155; }
            #template-wrapper h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
            #template-wrapper table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
            #template-wrapper th { text-align: left; padding: 1rem; background-color: #f1f5f9; font-weight: 700; color: #475569; }
            #template-wrapper td { padding: 1rem; border-bottom: 1px solid #e2e8f0; }
            #template-wrapper .header-bar { 
                position: absolute; top: 0; left: 0; right: 0; height: 12px; background-color: var(--accent-color); 
            }
        `;

        const classicStyles = `
            #template-wrapper { font-family: 'Merriweather', serif; color: #000; padding: 4rem; position: relative; }
            #template-wrapper::after { content: ''; position: absolute; top: 1rem; bottom: 1rem; left: 1rem; right: 1rem; border: 1px solid #e2e8f0; pointer-events: none; }
            #template-wrapper h1 { 
                font-size: 2.25rem; 
                text-align: center; 
                margin-bottom: 3rem; 
                border-bottom: 3px double var(--accent-color); 
                display: inline-block;
                width: 100%;
                padding-bottom: 1rem;
                font-weight: 700;
            }
            #template-wrapper h2 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; text-decoration: underline; text-decoration-color: var(--accent-color); }
            #template-wrapper table { width: 100%; margin-top: 2rem; border-top: 2px solid #000; border-bottom: 2px solid #000; }
            #template-wrapper th { text-align: left; padding: 0.5rem; font-style: italic; border-bottom: 1px solid #000; }
            #template-wrapper td { padding: 0.5rem; }
        `;

        const minimalStyles = `
            #template-wrapper { font-family: 'Courier New', monospace; color: #333; padding: 3rem; }
            #template-wrapper h1 { 
                font-size: 3rem; 
                font-weight: 400; 
                letter-spacing: -2px; 
                margin-bottom: 4rem; 
            }
            #template-wrapper h2 { font-size: 1rem; font-weight: 700; text-transform: uppercase; margin-top: 3rem; margin-bottom: 1rem; letter-spacing: 2px; }
            #template-wrapper p { margin-bottom: 1.5rem; line-height: 1.8; }
            #template-wrapper table { width: 100%; margin-top: 3rem; }
            #template-wrapper th { text-align: left; padding: 1rem 0; font-weight: 400; border-bottom: 1px dashed #ccc; }
            #template-wrapper td { padding: 1rem 0; border-bottom: 1px dashed #eee; }
        `;

        if (template === 'classic') return classicStyles;
        if (template === 'minimal') return minimalStyles;
        return modernStyles; // Default modern
    };

    return (
        <div 
            className="flex h-full flex-col lg:flex-row relative touch-pan-y"
            {...swipeHandlers}
        >
            {showVoiceManager && <BrandVoiceManager onClose={() => setShowVoiceManager(false)} />}

            {/* Mobile/Tablet Tab Switcher */}
            <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20">
                <button 
                    onClick={() => setMobileTab('input')} 
                    className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileTab === 'input' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Layout size={16}/> Input
                </button>
                <button 
                    onClick={() => setMobileTab('result')} 
                    className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileTab === 'result' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Eye size={16}/> Result {documentContent && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                </button>
            </div>

            {/* Input Panel */}
            <div className={`w-full lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-6 pt-6 pb-24 lg:pb-6 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 flex-shrink-0 ${mobileTab === 'result' ? 'hidden lg:block' : 'flex-1 lg:block'}`}>
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            {isImageTool ? <ImageIcon size={24} /> : <FileText size={24} />}
                        </div>
                        {isAutoSaving ? (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Save size={10} className="animate-pulse"/> Saving...</span>
                        ) : (
                            <span className="text-[10px] text-green-500 flex items-center gap-1"><Check size={10}/> Draft Saved</span>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tool.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{tool.description}</p>
                </div>
                
                {/* Dynamic Inputs */}
                <div className="space-y-5 md:pb-0">
                    
                    {/* Template & Color Selector for Supported Tools */}
                    {hasTemplates && (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-right">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Layout size={14} /> Design Style
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {['modern', 'classic', 'minimal'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTemplate(t as any)}
                                            className={`px-3 py-2 text-xs font-bold rounded-lg capitalize border transition-all ${
                                                template === t 
                                                ? 'bg-white dark:bg-slate-700 shadow-sm border-indigo-500 text-indigo-600 dark:text-white' 
                                                : 'border-transparent hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Palette size={14} /> Brand Color
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {ACCENT_COLORS.map(c => (
                                        <button
                                            key={c.name}
                                            onClick={() => setAccentColor(c.value)}
                                            className={`w-8 h-8 rounded-full ${c.twBg} border-2 transition-all ${accentColor === c.value ? 'border-white dark:border-slate-900 shadow-md scale-110 ring-2 ' + c.twRing : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'}`}
                                            title={c.name}
                                            aria-label={`Select ${c.name} color`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {!isImageTool && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Brand Voice</label>
                                <button onClick={() => setShowVoiceManager(true)} className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline">
                                    <Settings2 size={12} /> Manage
                                </button>
                            </div>
                            <select 
                                value={selectedVoiceId || ''}
                                onChange={(e) => setSelectedVoiceId(e.target.value || null)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="">Default AI Tone</option>
                                {brandVoices.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
                            </select>
                        </div>
                    )}

                    {tool.inputs.map((input) => (
                        <div key={input.name}>
                            {input.type === 'textarea' ? (
                                <Textarea 
                                    label={input.label}
                                    placeholder={input.placeholder}
                                    value={formValues[input.name] || ''}
                                    onChange={(e) => setFormValues(prev => ({...prev, [input.name]: e.target.value}))}
                                />
                            ) : input.type === 'select' ? (
                                <Select
                                    label={input.label}
                                    options={input.options || []}
                                    value={formValues[input.name] || ''}
                                    onChange={(e) => setFormValues(prev => ({...prev, [input.name]: e.target.value}))}
                                />
                            ) : (
                                <Input
                                    label={input.label}
                                    placeholder={input.placeholder}
                                    value={formValues[input.name] || ''}
                                    onChange={(e) => setFormValues(prev => ({...prev, [input.name]: e.target.value}))}
                                />
                            )}
                        </div>
                    ))}
                    
                    {!isImageTool && (
                        <div>
                             <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 tracking-wide flex items-center gap-1">
                                 <Tag size={12} /> Tags
                             </label>
                             <input 
                                type="text"
                                placeholder="e.g. marketing, draft, Q4"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 p-3 text-sm transition-all text-slate-900 dark:text-white placeholder-slate-400"
                             />
                             <p className="text-[10px] text-slate-400 mt-1">Comma separated</p>
                        </div>
                    )}

                    <Button onClick={handleGenerate} isLoading={isLoading} className="w-full mt-8 py-3.5">
                        {isLoading ? (isImageTool ? t('dashboard.thinking') : "Generating...") : t('dashboard.generate')}
                    </Button>
                </div>
            </div>

            {/* Preview Only Area */}
            <div className={`flex-1 bg-slate-100 dark:bg-slate-950 p-4 md:p-8 overflow-hidden flex flex-col relative ${mobileTab === 'input' ? 'hidden lg:flex' : 'flex h-full'}`}>
                {/* 
                    Outer wrapper: This holds the whole preview panel. 
                    If we have templates, we show the styled document inside.
                    If not, we show the default white card.
                */}
                <div className={`flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full h-full relative ${hasTemplates ? '' : 'bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800'}`}>
                    
                    {/* Toolbar */}
                    <div className={`h-14 flex items-center justify-between px-4 flex-shrink-0 z-20 relative ${hasTemplates ? 'bg-transparent mb-4' : 'border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl'}`}>
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide px-2">Output</div>
                            {documentContent && stats && (
                                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                    <span>{stats.words} words</span>
                                    <span>•</span>
                                    <span>{stats.chars} chars</span>
                                    <span>•</span>
                                    <span>{stats.readTime} min read</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="secondary" size="sm" onClick={handleSaveToDocuments} title="Save to Documents" icon={Save}>
                                 Save
                             </Button>
                             {/* Insert Signature Helper for Contracts */}
                             {tool.id === ToolType.CONTRACT_GEN && (
                                <Button variant="secondary" size="sm" onClick={insertSignature} title="Insert Signature Line" icon={PenTool}>
                                    Sign Line
                                </Button>
                             )}
                             <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                             
                             {isImageTool ? (
                                <Button variant="primary" size="sm" onClick={handleDownloadImage} title="Download Image" icon={Download}>
                                    Download
                                </Button>
                             ) : (
                                <>
                                    {/* TTS Button */}
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handleListen} 
                                        title={isPlaying ? "Stop" : "Read Aloud"} 
                                        icon={isGeneratingAudio ? Sparkles : isPlaying ? Square : Volume2} 
                                        className={isPlaying ? "text-red-500 animate-pulse" : ""}
                                    />
                                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                    <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy Content" icon={Copy} />
                                    {isHtmlOutput && <Button variant="ghost" size="sm" onClick={handleCopyHtml} title="Copy HTML" icon={Code} />}
                                    <Button variant="ghost" size="sm" onClick={handleExportWord} title="Export as Word" icon={isPro ? FileType : Lock} disabled={!isPro && false} />
                                    <Button variant="ghost" size="sm" onClick={handleDownloadPDF} title="Export as PDF" icon={isPro ? Download : Lock} disabled={!isPro && false} />
                                </>
                             )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 overflow-y-auto custom-scrollbar relative ${hasTemplates ? 'flex justify-center items-start' : 'p-8 pb-24 md:p-12 md:pb-12'}`}>
                        
                        {/* 
                            This is the styled container for Templates. 
                            It wraps the content content to apply visual styles.
                            We apply CSS variables here so they update instantly.
                        */}
                        {hasTemplates && <style>{getTemplateStyles()}</style>}

                        <div 
                            id="template-wrapper" 
                            className={`relative transition-all duration-500 ${hasTemplates ? 'bg-white shadow-xl mb-20 w-full max-w-[210mm] min-h-[297mm]' : 'z-10 h-full w-full'}`}
                            style={{ 
                                '--accent-color': accentColor,
                            } as React.CSSProperties}
                        >
                            
                            {/* Watermark */}
                            {!isPro && <Watermark className="z-0" />}
                            
                            {/* Decorative Header Bar for Modern */}
                            {hasTemplates && template === 'modern' && (
                                <div className="header-bar"></div>
                            )}

                            {/* Actual Content Render */}
                            <div className={`${hasTemplates ? '' : ''} relative z-10 h-full`}>
                                {isLoading && !documentContent ? (
                                    <div className="space-y-4 max-w-2xl mx-auto pt-10">
                                        {isImageTool ? (
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <Skeleton height={300} width="100%" className="rounded-xl mb-4" />
                                                <p className="text-slate-400 animate-pulse">Generating your image...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Skeleton height={40} width="60%" />
                                                <Skeleton height={20} />
                                                <Skeleton height={20} />
                                                <Skeleton height={20} width="90%" />
                                                <div className="h-8"></div>
                                                <Skeleton height={150} />
                                                <Skeleton height={20} width="40%" />
                                            </>
                                        )}
                                    </div>
                                ) : documentContent ? (
                                    isImageTool ? (
                                        <div className="flex items-center justify-center h-full">
                                            <img 
                                                src={documentContent} 
                                                alt="Generated AI Art" 
                                                className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
                                            />
                                        </div>
                                    ) : isHtmlOutput ? (
                                        <div 
                                            className={`max-w-none w-full h-full`} 
                                            ref={previewRef}
                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(documentContent) }}
                                        />
                                    ) : (
                                        <div className={`prose dark:prose-invert max-w-none prose-indigo prose-lg`} ref={previewRef}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{documentContent}</ReactMarkdown>
                                        </div>
                                    )
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                                        <Sparkles size={48} className="mb-4 opacity-50" />
                                        <p className="text-sm font-medium">Ready to create.</p>
                                        <p className="text-xs mt-2 opacity-70">Fill in the details on the left to start.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericTool;
