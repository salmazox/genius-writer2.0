
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Bold, Italic, Underline, List, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    className?: string;
}

const MAX_HISTORY = 50;

const RichTextEditor: React.FC<RichTextEditorProps> = React.memo(({ value, onChange, className }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isTyping = useRef(false);

    // History State
    const [history, setHistory] = useState<string[]>([value]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Sync initial value or external updates (e.g. AI generation)
    useEffect(() => {
        if (editorRef.current && !isTyping.current && editorRef.current.innerHTML !== value) {
             editorRef.current.innerHTML = value;
             // If external change (like AI generation), push to history
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
        if (newHTML !== value) {
            onChange(newHTML);
        }
    }, [onChange, value]);
    
    const handleBlur = useCallback(() => {
        isTyping.current = false;
        // Save to history on blur to avoid saving every keystroke
        addToHistory(value);
    }, [addToHistory, value]);

    const exec = useCallback((command: string, val: string | undefined = undefined) => {
        document.execCommand(command, false, val);
        editorRef.current?.focus();
        // Exec command changes content immediately
        if (editorRef.current) {
             const newVal = editorRef.current.innerHTML;
             onChange(newVal);
             addToHistory(newVal);
        }
    }, [addToHistory, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                handleRedo();
            } else {
                handleUndo();
            }
        }
    }, [handleRedo, handleUndo]);

    return (
        <div className={`border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 ${className}`}>
            <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50" role="toolbar" aria-label="Text Formatting">
                 <button onClick={() => exec('bold')} aria-label="Bold" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors" title="Bold (Ctrl+B)"><Bold size={14}/></button>
                 <button onClick={() => exec('italic')} aria-label="Italic" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors" title="Italic (Ctrl+I)"><Italic size={14}/></button>
                 <button onClick={() => exec('underline')} aria-label="Underline" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors" title="Underline (Ctrl+U)"><Underline size={14}/></button>
                 <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" role="separator" />
                 <button onClick={() => exec('insertUnorderedList')} aria-label="Bullet List" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors" title="Bullet List"><List size={14}/></button>
                 <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" role="separator" />
                 <button 
                    onClick={handleUndo} 
                    disabled={historyIndex === 0}
                    aria-label="Undo" 
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-30" 
                    title="Undo (Ctrl+Z)"
                 >
                     <Undo size={14}/>
                 </button>
                 <button 
                    onClick={handleRedo} 
                    disabled={historyIndex === history.length - 1}
                    aria-label="Redo" 
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-30" 
                    title="Redo (Ctrl+Shift+Z)"
                 >
                     <Redo size={14}/>
                 </button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="p-3 min-h-[140px] outline-none text-sm rich-text-content text-slate-900 dark:text-slate-200"
                style={{ minHeight: '140px' }}
                aria-label="Rich Text Editor"
            />
        </div>
    );
});

export default RichTextEditor;
