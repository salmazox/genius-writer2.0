import React, { useState, useEffect } from 'react';
import { Copy, Loader2, ArrowDown, BookOpen } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { GlossaryManager } from '../components/GlossaryManager';
import {
  TranslationGlossary,
  findGlossariesForLanguagePair,
  getGlossaryPromptContext
} from '../services/translationGlossary';

const LANGUAGES = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Polish", "Russian",
    "Chinese (Simplified)", "Chinese (Traditional)", "Japanese", "Korean", "Hindi", "Arabic", "Turkish",
    "Indonesian", "Vietnamese", "Thai", "Swedish", "Danish", "Norwegian", "Finnish", "Greek", "Czech",
    "Romanian", "Hungarian", "Ukrainian", "Hebrew", "Malay", "Tagalog"
];

const Translator: React.FC = () => {
    const copyToClipboard = useCopyToClipboard();

    // Persist state
    const [sourceLang, setSourceLang] = useLocalStorage<string>('trans_source', '');
    const [targetLang, setTargetLang] = useLocalStorage<string>('trans_target', 'English');
    const [documentContent, setDocumentContent] = useLocalStorage<string>('trans_content', '');

    const [translationOutput, setTranslationOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Glossary state
    const [showGlossaryManager, setShowGlossaryManager] = useState(false);
    const [selectedGlossary, setSelectedGlossary] = useState<TranslationGlossary | null>(null);
    const [availableGlossaries, setAvailableGlossaries] = useState<TranslationGlossary[]>([]);

    // Debounce the content to prevent API spam
    const debouncedContent = useDebounce(documentContent, 1000);

    // Load available glossaries when languages change
    useEffect(() => {
        if (sourceLang && targetLang) {
            const glossaries = findGlossariesForLanguagePair(sourceLang.toLowerCase(), targetLang.toLowerCase());
            setAvailableGlossaries(glossaries);

            // Auto-select first glossary if available
            if (glossaries.length > 0 && !selectedGlossary) {
                setSelectedGlossary(glossaries[0]);
            }
        }
    }, [sourceLang, targetLang]);

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
                // Build translation prompt with glossary context
                let translationPrompt = debouncedContent;

                if (selectedGlossary) {
                    const glossaryContext = getGlossaryPromptContext(selectedGlossary);
                    translationPrompt = glossaryContext + '\n\n' + debouncedContent;
                }

                // Use secure backend API for translation
                const systemInstruction = `You are a professional UN-level interpreter and translator.
Your task is to provide a translation that is not just literally correct, but culturally nuanced and native-sounding.
Rules:
1. Preserve the original tone (formal, casual, technical).
2. Do NOT add preamble like "Here is the translation". Just output the target text.
3. If the input is empty, return empty string.`;

                const response = await aiService.generate({
                    prompt: `Source Text:\n"${translationPrompt}"\n\nTarget Language: ${targetLang || 'English'}`,
                    model: 'gemini-2.5-flash',
                    systemInstruction: systemInstruction,
                    temperature: 0.7
                });

                if (isMounted) setTranslationOutput(response.text);
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        translateText();
        return () => { isMounted = false; };
    }, [debouncedContent, sourceLang, targetLang, selectedGlossary]);

    return (
        <>
            <div className="flex h-full flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                {/* Source */}
                <div className="flex-1 p-4 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-[300px]">
                    <div className="mb-4 space-y-2">
                        <div className="flex justify-between items-center">
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

                        {/* Glossary Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowGlossaryManager(true)}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                                title="Manage Glossaries"
                            >
                                <BookOpen size={14} />
                                <span>Glossaries</span>
                            </button>

                            {availableGlossaries.length > 0 && (
                                <select
                                    value={selectedGlossary?.id || ''}
                                    onChange={(e) => {
                                        const glossary = availableGlossaries.find(g => g.id === e.target.value);
                                        setSelectedGlossary(glossary || null);
                                    }}
                                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                                >
                                    <option value="">No Glossary</option>
                                    {availableGlossaries.map(g => (
                                        <option key={g.id} value={g.id}>
                                            {g.name} ({g.entries.length} terms)
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
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
                        <button onClick={() => copyToClipboard(translationOutput)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                            <Copy size={18} className="text-slate-500"/>
                        </button>
                    </div>
                </div>
                <div id="translation-output" className="flex-1 text-lg md:text-xl text-slate-800 dark:text-slate-200 overflow-y-auto pb-24 md:pb-0">
                    {translationOutput || <span className="text-slate-400 italic">Translation appears here...</span>}
                </div>
            </div>
        </div>

        {/* Glossary Manager Modal */}
        <GlossaryManager
            isOpen={showGlossaryManager}
            onClose={() => setShowGlossaryManager(false)}
            sourceLang={sourceLang.toLowerCase()}
            targetLang={targetLang.toLowerCase()}
            onSelectGlossary={(glossary) => {
                setSelectedGlossary(glossary);
                setShowGlossaryManager(false);
            }}
        />
    </>
    );
};

export default Translator;