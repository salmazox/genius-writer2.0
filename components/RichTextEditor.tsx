
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { 
    Bold, Italic, Underline, List, Undo, Redo, Sparkles, Loader2, 
    Image as ImageIcon, Link as LinkIcon, Heading1, Heading2, Heading3, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Indent, Outdent, 
    Palette, Wand2, Type, Baseline, Mic, MicOff
} from 'lucide-react';
import { refineContent } from '../services/gemini';
import { useToast } from '../contexts/ToastContext';

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    hideToolbar?: boolean;
    style?: React.CSSProperties;
}

const MAX_HISTORY = 50;

const RichTextEditor: React.FC<RichTextEditorProps> = React.memo(({ value, onChange, className, placeholder, hideToolbar = false, style }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isTyping = useRef(false);
    const { showToast } = useToast();

    // History State
    const [history, setHistory] = useState<string[]>([value]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Toolbar & Feature State
    const [showSmartToolbar, setShowSmartToolbar] = useState(false);
    const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
    const [isRefining, setIsRefining] = useState(false);
    const [selectionRange, setSelectionRange] = useState<Range | null>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Sync initial value or external updates
    useEffect(() => {
        if (editorRef.current && !isTyping.current && editorRef.current.innerHTML !== value) {
             editorRef.current.innerHTML = value;
             addToHistory(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const addToHistory = useCallback((newValue: string) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            if (newHistory[newHistory.length - 1] === newValue) return prev;
            
            const updated = [...newHistory, newValue];
            if (updated.length > MAX_HISTORY) updated.shift();
            return updated;
        });
        setHistoryIndex(prev => {
            const newIndex = prev + 1;
            return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
        });
    }, [historyIndex]);

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) return sel.getRangeAt(0);
        return null;
    };

    const restoreSelection = (range: Range | null) => {
        if (!range) return;
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    // --- Voice Dictation ---
    const toggleDictation = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast("Voice dictation not supported in this browser.", "error");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            showToast("Listening...", "info");
        };

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            
            // Only update on final result to avoid cursor jumping too crazily
            if (event.results[0].isFinal) {
                 document.execCommand('insertText', false, transcript + ' ');
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    // --- Floating Toolbar Logic ---
    const checkSelection = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
            setShowSmartToolbar(false);
            return;
        }

        const range = selection.getRangeAt(0);
        if (!editorRef.current?.contains(range.commonAncestorContainer)) {
             setShowSmartToolbar(false);
             return;
        }

        setSelectionRange(range);
        const rect = range.getBoundingClientRect();
        
        setToolbarPos({
            top: rect.top - 50,
            left: rect.left + (rect.width / 2)
        });
        setShowSmartToolbar(true);
    }, []);

    const handleRefine = async (instruction: string) => {
        let textToRefine = "";
        let isFullDoc = false;

        if (selectionRange && !selectionRange.collapsed) {
             textToRefine = selectionRange.toString();
        } else if (editorRef.current) {
             textToRefine = editorRef.current.innerText; 
             isFullDoc = true;
        }

        if (!textToRefine) {
            showToast("No text to refine", "error");
            return;
        }
        
        setIsRefining(true);
        
        try {
            const refined = await refineContent(textToRefine, instruction);
            
            if (!isFullDoc && selectionRange) {
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(selectionRange);
                document.execCommand('insertText', false, refined);
            } else if (isFullDoc && editorRef.current) {
                editorRef.current.innerText = refined; 
            }
            
            if (editorRef.current) {
                const newVal = editorRef.current.innerHTML;
                onChange(newVal);
                addToHistory(newVal);
            }
            
            setShowSmartToolbar(false);
            showToast("Text refined!", "success");
        } catch (e) {
            console.error("Refinement failed", e);
            showToast("AI Refinement failed", "error");
        } finally {
            setIsRefining(false);
        }
    };

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const previousValue = history[newIndex];
            setHistoryIndex(newIndex);
            if (editorRef.current) editorRef.current.innerHTML = previousValue;
            onChange(previousValue);
        }
    }, [history, historyIndex, onChange]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextValue = history[newIndex];
            setHistoryIndex(newIndex);
            if (editorRef.current) editorRef.current.innerHTML = nextValue;
            onChange(nextValue);
        }
    }, [history, historyIndex, onChange]);

    const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
        isTyping.current = true;
        const newHTML = e.currentTarget.innerHTML;
        
        // Slash Command Detection (Basic)
        const selection = window.getSelection();
        if (selection && selection.focusNode?.textContent?.endsWith('/')) {
             // In a real app, you'd trigger a popup menu here. 
             // For now, we'll just log it or show a toast as "detected"
             // console.log("Slash command triggered");
        }

        if (newHTML !== value) {
            onChange(newHTML);
        }
    }, [onChange, value]);
    
    const handleBlur = useCallback(() => {
        isTyping.current = false;
        addToHistory(value);
    }, [addToHistory, value]);

    const exec = useCallback((command: string, val: string | undefined = undefined) => {
        document.execCommand(command, false, val);
        editorRef.current?.focus();
        if (editorRef.current) {
             const newVal = editorRef.current.innerHTML;
             onChange(newVal);
             addToHistory(newVal);
        }
    }, [addToHistory, onChange]);

    const handleInsertImage = () => {
        const currentRange = saveSelection();
        setTimeout(() => {
            const url = prompt("Enter Image URL (e.g. https://example.com/image.png)");
            restoreSelection(currentRange);
            if(url) exec('insertImage', url);
        }, 0);
    };

    const handleInsertLink = () => {
        const currentRange = saveSelection();
        setTimeout(() => {
            const url = prompt("Enter URL (e.g. https://google.com)");
            restoreSelection(currentRange);
            if(url) exec('createLink', url);
        }, 0);
    };

    const ToolbarButton = ({ onClick, icon: Icon, title, active = false }: { onClick: () => void, icon: any, title: string, active?: boolean }) => (
        <button 
            onClick={onClick} 
            className={`p-1.5 rounded transition-colors ${active ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            title={title}
        >
            <Icon size={16} />
        </button>
    );

    const Divider = () => <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />;

    return (
        <div className={`relative ${className} flex flex-col`} style={style}>
            {showSmartToolbar && (
                <div 
                    className="fixed z-[9999] transform -translate-x-1/2 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 p-1.5 flex items-center gap-1 animate-in zoom-in-95 duration-200"
                    style={{ top: toolbarPos.top, left: toolbarPos.left }}
                >
                    {isRefining ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium">
                            <Loader2 size={14} className="animate-spin text-indigo-400" />
                            Refining...
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-1 px-2 border-r border-slate-700 mr-1">
                                <Sparkles size={14} className="text-indigo-400 fill-indigo-400" />
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">AI</span>
                            </div>
                            <button onClick={() => handleRefine("Fix grammar and spelling")} className="px-3 py-1.5 hover:bg-slate-800 rounded text-xs font-medium transition-colors whitespace-nowrap">Fix Grammar</button>
                            <button onClick={() => handleRefine("Make it shorter and more concise")} className="px-3 py-1.5 hover:bg-slate-800 rounded text-xs font-medium transition-colors whitespace-nowrap">Shorten</button>
                            <button onClick={() => handleRefine("Improve wording and flow")} className="px-3 py-1.5 hover:bg-slate-800 rounded text-xs font-medium transition-colors whitespace-nowrap">Improve</button>
                            <button onClick={() => handleRefine("Change tone to professional")} className="px-3 py-1.5 hover:bg-slate-800 rounded text-xs font-medium transition-colors whitespace-nowrap">Formal</button>
                        </>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                </div>
            )}

            {!hideToolbar && (
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 rounded-t-lg select-none" role="toolbar" aria-label="Text Formatting">
                    <div className="flex gap-0.5">
                        <ToolbarButton onClick={handleUndo} icon={Undo} title="Undo" />
                        <ToolbarButton onClick={handleRedo} icon={Redo} title="Redo" />
                    </div>
                    <Divider />
                    <div className="flex gap-1 items-center">
                        <select onChange={(e) => exec('fontName', e.target.value)} className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded px-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-28 focus:outline-none focus:border-indigo-500">
                            <option value="Inter">Inter (Default)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Merriweather">Merriweather</option>
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Fira Code">Monospace</option>
                        </select>
                        <select onChange={(e) => exec('fontSize', e.target.value)} className="h-7 text-xs border border-slate-300 dark:border-slate-700 rounded px-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-16 focus:outline-none focus:border-indigo-500">
                            <option value="3">11pt</option>
                            <option value="1">8pt</option>
                            <option value="2">10pt</option>
                            <option value="4">14pt</option>
                            <option value="5">18pt</option>
                            <option value="6">24pt</option>
                            <option value="7">36pt</option>
                        </select>
                    </div>
                    <Divider />
                    <div className="flex gap-0.5">
                        <ToolbarButton onClick={() => exec('formatBlock', 'H1')} icon={Heading1} title="Heading 1" />
                        <ToolbarButton onClick={() => exec('formatBlock', 'H2')} icon={Heading2} title="Heading 2" />
                        <ToolbarButton onClick={() => exec('formatBlock', 'H3')} icon={Heading3} title="Heading 3" />
                    </div>
                    <Divider />
                    <div className="flex gap-0.5">
                        <ToolbarButton onClick={() => exec('bold')} icon={Bold} title="Bold" />
                        <ToolbarButton onClick={() => exec('italic')} icon={Italic} title="Italic" />
                        <ToolbarButton onClick={() => exec('underline')} icon={Underline} title="Underline" />
                        <div className="w-7 h-7 relative flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors ml-1">
                            <Baseline size={16} className="text-slate-600 dark:text-slate-300 pointer-events-none" />
                            <div className="absolute bottom-1 right-1 w-2 h-0.5 bg-red-500"></div>
                            <input type="color" onChange={(e) => exec('foreColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" title="Text Color" />
                        </div>
                    </div>
                    <Divider />
                    <div className="flex gap-0.5">
                        <ToolbarButton onClick={() => exec('justifyLeft')} icon={AlignLeft} title="Align Left" />
                        <ToolbarButton onClick={() => exec('justifyCenter')} icon={AlignCenter} title="Align Center" />
                        <ToolbarButton onClick={() => exec('justifyRight')} icon={AlignRight} title="Align Right" />
                        <ToolbarButton onClick={() => exec('justifyFull')} icon={AlignJustify} title="Justify" />
                    </div>
                    <Divider />
                    <div className="flex gap-0.5">
                        <ToolbarButton onClick={() => exec('insertUnorderedList')} icon={List} title="Bullet List" />
                        <ToolbarButton onClick={() => exec('indent')} icon={Indent} title="Indent" />
                        <ToolbarButton onClick={() => exec('outdent')} icon={Outdent} title="Outdent" />
                    </div>
                    <Divider />
                    <div className="flex gap-0.5">
                        <ToolbarButton onClick={handleInsertLink} icon={LinkIcon} title="Insert Link" />
                        <ToolbarButton onClick={handleInsertImage} icon={ImageIcon} title="Insert Image" />
                    </div>
                    <Divider />
                    {/* Voice & AI */}
                    <div className="flex gap-1 ml-auto">
                        <button 
                            onClick={toggleDictation}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-bold transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                            title="Voice Dictation"
                        >
                            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                        </button>
                        <button 
                            onClick={() => handleRefine("Fix any typos, grammar mistakes, and improve clarity slightly without changing the meaning.")} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold transition-colors"
                            title="Auto Fix Typos & Grammar"
                        >
                            <Wand2 size={14} /> Magic Fix
                        </button>
                    </div>
                </div>
            )}
            
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onMouseUp={checkSelection}
                onKeyUp={checkSelection}
                onBlur={handleBlur}
                className="flex-1 p-8 outline-none text-base leading-relaxed rich-text-content text-slate-900 dark:text-slate-100 min-h-[inherit]"
                style={style}
                data-placeholder={placeholder}
                aria-label="Rich Text Editor"
            />
            {(!value && placeholder) && (
                <div className="absolute top-[68px] left-8 text-slate-300 dark:text-slate-600 pointer-events-none select-none text-base">
                    {placeholder}
                </div>
            )}
        </div>
    );
});

export default RichTextEditor;
