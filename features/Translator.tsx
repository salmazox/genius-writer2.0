
import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Loader2, ArrowDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { generateContent } from '../services/gemini';
import { ToolType } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';

const LANGUAGES = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Polish", "Russian",
    "Chinese (Simplified)", "Chinese (Traditional)", "Japanese", "Korean", "Hindi", "Arabic", "Turkish",
    "Indonesian", "Vietnamese", "Thai", "Swedish", "Danish", "Norwegian", "Finnish", "Greek", "Czech",
    "Romanian", "Hungarian", "Ukrainian", "Hebrew", "Malay", "Tagalog"
];

const Translator: React.FC = () => {
    const { showToast } = useToast();
    
    // Persist state
    const [sourceLang, setSourceLang] = useLocalStorage<string>('trans_source', '');
    const [targetLang, setTargetLang] = useLocalStorage<string>('trans_target', 'English');
    const [documentContent, setDocumentContent] = useLocalStorage<string>('trans_content', '');
    
    const [translationOutput, setTranslationOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Debounce the content to prevent API spam
    const debouncedContent = useDebounce(documentContent, 1000);

    // Instant Translation Effect
    useEffect(() => {
        let isMounted = true;
        const translateText = async () => {
            if (!debouncedContent.trim()) {
                if (isMounted) setTranslationOutput('');
                return;
            }

            if (isMounted) setIsLoading(true);
            try {
                const result = await generateContent(
                    ToolType.TRANSLATE,
                    { content: debouncedContent, sourceLang, targetLang },
                    undefined
                );
                if (isMounted) setTranslationOutput(result);
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        translateText();
        return () => { isMounted = false; };
    }, [debouncedContent, sourceLang, targetLang]);

    const handleCopy = useCallback((text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'info');
    }, [showToast]);

    return (
        <div className="flex h-full flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
            {/* Source */}
            <div className="flex-1 p-4 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-[300px]">
                <div className="mb-4 flex justify-between items-center">
                    <input 
                        list="languages-list" 
                        value={sourceLang} 
                        onChange={(e) => setSourceLang(e.target.value)} 
                        placeholder="Detect Language" 
                        className="bg-transparent font-bold text-indigo-600 focus:outline-none placeholder-indigo-300 w-full" 
                    />
                    <datalist id="languages-list">
                        {LANGUAGES.map(lang => <option key={lang} value={lang} />)}
                    </datalist>
                </div>
                <textarea 
                    className="flex-1 resize-none bg-transparent outline-none text-lg md:text-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-300" 
                    placeholder="Type to translate..."
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                />
                <div className="mt-2 text-xs text-slate-400 flex justify-end">
                    {isLoading ? <span className="flex items-center gap-1"><Loader2 className="animate-spin" size={12}/> Translating...</span> : <span>Autosaved</span>}
                </div>
            </div>

            {/* Tablet/Mobile divider icon */}
            <div className="lg:hidden flex justify-center -my-3 z-10">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-full p-1 text-slate-500">
                    <ArrowDown size={20} />
                </div>
            </div>

            {/* Target */}
            <div className="flex-1 p-4 md:p-8 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-[300px]">
                <div className="mb-4 flex justify-between items-center">
                    <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="bg-transparent font-bold text-indigo-600 focus:outline-none"
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <button onClick={() => handleCopy(translationOutput)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                            <Copy size={18} className="text-slate-500"/>
                        </button>
                    </div>
                </div>
                <div id="translation-output" className="flex-1 text-lg md:text-xl text-slate-800 dark:text-slate-200 overflow-y-auto pb-24 md:pb-0">
                    {translationOutput || <span className="text-slate-400 italic">Translation appears here...</span>}
                </div>
            </div>
        </div>
    );
};

export default Translator;
