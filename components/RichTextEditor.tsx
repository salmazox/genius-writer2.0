import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isTyping = useRef(false);

    // Sync initial value or external updates (e.g. AI generation)
    useEffect(() => {
        if (editorRef.current && !isTyping.current && editorRef.current.innerHTML !== value) {
             editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        isTyping.current = true;
        onChange(e.currentTarget.innerHTML);
    };
    
    const handleBlur = () => {
        isTyping.current = false;
    }

    const exec = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (!selection?.rangeCount) return;
            const range = selection.getRangeAt(0);
            const li = range.commonAncestorContainer.parentElement?.closest('li');
            if (li) return; 
        }
    };

    return (
        <div className={`border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 ${className}`}>
            <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                 <button onClick={() => exec('bold')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Bold"><Bold size={14}/></button>
                 <button onClick={() => exec('italic')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Italic"><Italic size={14}/></button>
                 <button onClick={() => exec('underline')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Underline"><Underline size={14}/></button>
                 <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                 <button onClick={() => exec('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Bullet List"><List size={14}/></button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="p-3 min-h-[140px] outline-none text-sm rich-text-content text-slate-900 dark:text-slate-200"
                style={{ minHeight: '140px' }}
            />
        </div>
    );
};

export default RichTextEditor;