
import React, { useState, useEffect, useRef } from 'react';
import { Copy, FileText, Layout, Eye, Download, FileType, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ToolConfig } from '../types';
import { generateContent } from '../services/gemini';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Forms';
import { Skeleton } from '../components/ui/Skeleton';

interface GenericToolProps {
    tool: ToolConfig;
}

const GenericTool: React.FC<GenericToolProps> = ({ tool }) => {
    const { t } = useThemeLanguage();
    const { showToast } = useToast();
    const { brandVoices, selectedVoiceId, setSelectedVoiceId } = useUser();
    
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [documentContent, setDocumentContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [mobileTab, setMobileTab] = useState<'input' | 'result'>('input');
    
    const previewRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Reset when tool changes
    useEffect(() => {
        setFormValues({});
        setDocumentContent('');
        setMobileTab('input');
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, [tool.id]);

    const handleGenerate = async () => {
        // Cancel previous request if active
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new controller
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        const selectedVoice = brandVoices.find(v => v.id === selectedVoiceId);
        
        try {
            const result = await generateContent(
                tool.id, 
                formValues, 
                selectedVoice ? `${selectedVoice.name}: ${selectedVoice.description}` : undefined,
                controller.signal
            );
            setDocumentContent(result);
            showToast(t('dashboard.toasts.generated'), 'success');
            
            // Auto-switch to result tab on mobile/tablet after generation
            setMobileTab('result');
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error(e);
                showToast(t('dashboard.toasts.error'), 'error');
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        }
    };

    const handleCopy = () => {
        if (!documentContent) return;
        navigator.clipboard.writeText(documentContent);
        showToast(t('dashboard.toasts.copied'), 'info');
    };

    const handleExportWord = () => {
        if (!documentContent) {
            showToast("No content to export", "error");
            return;
        }
        
        const element = previewRef.current;
        if (!element) return;

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
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
        if (!documentContent) {
            showToast("No content to export", "error");
            return;
        }
        const element = previewRef.current;
        if (!element) return;
        const opt = {
            margin: 1,
            filename: `${tool.name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        if (window.html2pdf) {
            showToast("Generating PDF...", "info");
            window.html2pdf().set(opt).from(element).save();
        } else {
            showToast("PDF Library not loaded.", "error");
        }
    };

    return (
        <div className="flex h-full flex-col lg:flex-row relative">
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
            <div className={`w-full lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 flex-shrink-0 ${mobileTab === 'result' ? 'hidden lg:block' : 'flex-1 lg:block'}`}>
                <div className="mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30">
                         <FileText size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tool.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{tool.description}</p>
                </div>
                
                {/* Dynamic Inputs */}
                <div className="space-y-5 md:pb-0">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Brand Voice</label>
                        <select 
                            value={selectedVoiceId || ''}
                            onChange={(e) => setSelectedVoiceId(e.target.value || null)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Default AI Tone</option>
                            {brandVoices.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
                        </select>
                    </div>

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

                    <Button onClick={handleGenerate} isLoading={isLoading} className="w-full mt-8 py-3.5">
                        {isLoading ? t('dashboard.thinking') : t('dashboard.generate')}
                    </Button>
                </div>
            </div>

            {/* Preview Only Area */}
            <div className={`flex-1 bg-slate-100 dark:bg-slate-950 p-4 md:p-8 overflow-hidden flex flex-col relative ${mobileTab === 'input' ? 'hidden lg:flex' : 'flex h-full'}`}>
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-w-5xl mx-auto w-full h-full">
                    
                    {/* Toolbar */}
                    <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900 flex-shrink-0">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wide px-2">Generated Output</div>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy Text" icon={Copy} />
                             <Button variant="ghost" size="sm" onClick={handleExportWord} title="Export as Word" icon={FileType} />
                             <Button variant="ghost" size="sm" onClick={handleDownloadPDF} title="Export as PDF" icon={Download} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative p-8 md:p-12">
                        {isLoading ? (
                            <div className="space-y-4 max-w-2xl mx-auto">
                                <Skeleton height={40} width="60%" />
                                <Skeleton height={20} />
                                <Skeleton height={20} />
                                <Skeleton height={20} width="90%" />
                                <div className="h-8"></div>
                                <Skeleton height={150} />
                                <Skeleton height={20} width="40%" />
                            </div>
                        ) : documentContent ? (
                            <div className="prose dark:prose-invert max-w-none prose-indigo prose-lg" ref={previewRef}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{documentContent}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Sparkles size={48} className="mb-4 opacity-50" />
                                <p className="text-sm font-medium">Ready to create.</p>
                                <p className="text-xs mt-2 opacity-70">Fill in the details on the left to start.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericTool;
