
import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { 
    Bold, Italic, Underline, List, ListOrdered, Undo, Redo, Sparkles, Loader2, 
    Image as ImageIcon, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, 
    Check, X, Wand2, Strikethrough, Upload,
    ChevronDown
} from 'lucide-react';
import { refineContent } from '../services/gemini';
import { useToast } from '../contexts/ToastContext';
import { validateImageFile } from '../utils/security';

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    hideToolbar?: boolean;
    style?: React.CSSProperties;
    showStats?: boolean;
}

const FONTS = [
    { name: 'Default', value: 'Inter, sans-serif' },
    { name: 'Serif', value: 'Merriweather, serif' },
    { name: 'Mono', value: "'Fira Code', monospace" },
    { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
];

const SIZES = [
    { name: 'Small', value: '2' },
    { name: 'Normal', value: '3' },
    { name: 'Large', value: '4' },
    { name: 'Huge', value: '5' },
    { name: 'Giant', value: '6' },
];

const RichTextEditor: React.FC<RichTextEditorProps> = React.memo(({ value, onChange, className = '', placeholder, hideToolbar = false, style, showStats = false }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();
    const isTypingRef = useRef(false);

    // State for UI
    const [activeFormats, setActiveFormats] = useState<string[]>([]);
    const [isRefining, setIsRefining] = useState(false);
    
    // Floating Menu State
    const [floatingPos, setFloatingPos] = useState<{top: number} | null>(null);
    const [selectedText, setSelectedText] = useState('');

    // State for Link/Image Input Mode
    const [inputMode, setInputMode] = useState<'link' | 'image' | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [savedRange, setSavedRange] = useState<Range | null>(null);

    // Helper to check if editor is effectively empty (handles <p><br></p>)
    const isEmpty = (html: string) => {
        if (!html) return true;
        const text = html.replace(/<[^>]*>/g, '').trim();
        return text === '' && !html.includes('<img');
    };

    // Sync external value changes if not typing
    useEffect(() => {
        if (editorRef.current && !isTypingRef.current && editorRef.current.innerHTML !== value) {
             editorRef.current.innerHTML = value;
        }
    }, [value]);

    // Calculate Stats
    const stats = useMemo(() => {
        if (!showStats) return null;
        const text = value.replace(/<[^>]*>/g, ' '); // Replace tags with space to prevent joining words
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = value.replace(/<[^>]*>/g, '').length;
        const readTime = Math.ceil(words / 200);
        // If it's effectively empty, force 0
        if (isEmpty(value)) return { words: 0, chars: 0, readTime: 0 };
        return { words, chars, readTime };
    }, [value, showStats]);

    // Handle Selection for Floating Menu & Active States
    const handleSelectionChange = useCallback(() => {
        const sel = window.getSelection();
        
        // 1. Update Active Formats (Toolbar state)
        if (document.activeElement === editorRef.current || editorRef.current?.contains(document.activeElement)) {
            const formats = [];
            if (document.queryCommandState('bold')) formats.push('bold');
            if (document.queryCommandState('italic')) formats.push('italic');
            if (document.queryCommandState('underline')) formats.push('underline');
            if (document.queryCommandState('strikethrough')) formats.push('strikethrough');
            if (document.queryCommandState('insertUnorderedList')) formats.push('ul');
            if (document.queryCommandState('insertOrderedList')) formats.push('ol');
            if (document.queryCommandState('justifyLeft')) formats.push('left');
            if (document.queryCommandState('justifyCenter')) formats.push('center');
            if (document.queryCommandState('justifyRight')) formats.push('right');
            
            const parentBlock = sel?.focusNode?.parentElement;
            if (parentBlock) {
                const tagName = parentBlock.tagName.toLowerCase();
                if (tagName === 'h1') formats.push('h1');
                if (tagName === 'h2') formats.push('h2');
                if (tagName === 'blockquote') formats.push('blockquote');
            }
            setActiveFormats(formats);
        }

        // 2. Handle Floating Menu Placement
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
            setFloatingPos(null);
            return;
        }

        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Ensure selection is inside OUR editor
        if (editorRef.current && editorRef.current.contains(sel.anchorNode)) {
            const text = sel.toString().trim();
            if (text.length > 0 && rect.width > 0) {
                // Position relative to viewport top, effectively placing it in the margin/sidebar
                setFloatingPos({
                    top: rect.top, 
                });
                setSelectedText(text);
            } else {
                setFloatingPos(null);
            }
        } else {
            setFloatingPos(null);
        }
    }, []);

    // Listen to selection changes globally to catch mouse up outside etc.
    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [handleSelectionChange]);

    const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
        isTypingRef.current = true;
        const newHTML = e.currentTarget.innerHTML;
        onChange(newHTML);
    }, [onChange]);

    const handleBlur = () => {
        isTypingRef.current = false;
    };

    const exec = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    // --- Media Input Handling ---

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            setSavedRange(sel.getRangeAt(0));
        }
    };

    const restoreSelection = () => {
        if (savedRange) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedRange);
            }
        }
    };

    const openInput = (mode: 'link' | 'image') => {
        saveSelection();
        setInputMode(mode);
        setInputValue('');
    };

    const closeInput = () => {
        setInputMode(null);
        setInputValue('');
        setSavedRange(null);
        editorRef.current?.focus();
    };

    const applyInput = () => {
        restoreSelection();
        if (inputMode === 'link') {
            if (inputValue) exec('createLink', inputValue);
            else exec('unlink');
        } else if (inputMode === 'image') {
            if (inputValue) exec('insertImage', inputValue);
        }
        closeInput();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validation = validateImageFile(file);
            if (!validation.valid) {
                showToast(validation.error || 'Invalid file', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                restoreSelection(); // Ensure we insert where cursor was
                exec('insertImage', ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
        // Reset
        if (fileInputRef.current) fileInputRef.current.value = '';
        closeInput(); // Close input bar after upload
    };

    const triggerFileUpload = () => {
        // We don't save selection here because we already saved it when opening the input mode
        // or we rely on the input mode being active.
        fileInputRef.current?.click();
    };

    // --- AI Features ---

    const handleRefine = async (instruction: string, textOverride?: string) => {
        const textToRefine = textOverride || selectedText || editorRef.current?.innerText;
        
        if (!textToRefine) {
            showToast("No text selected to refine", "error");
            return;
        }

        setIsRefining(true);
        try {
            const refined = await refineContent(textToRefine, instruction);
            
            // If we have a saved range or active selection, replace it
            if (textOverride && savedRange) {
                // Restore range to replace specifically the selected text
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(savedRange);
                document.execCommand('insertText', false, refined);
            } else if (selectedText) {
                document.execCommand('insertText', false, refined);
            } else if (editorRef.current) {
                editorRef.current.innerText = refined;
            }
            
            if (editorRef.current) onChange(editorRef.current.innerHTML);
            showToast("Text refined!", "success");
            setFloatingPos(null); // Close menu
        } catch (e) {
            showToast("Refinement failed", "error");
        } finally {
            setIsRefining(false);
        }
    };

    // --- Components ---

    const ToolbarButton = ({ 
        icon: Icon, 
        command, 
        arg, 
        isActive, 
        title,
        onClick 
    }: { 
        icon: any, 
        command?: string, 
        arg?: string, 
        isActive?: boolean, 
        title: string,
        onClick?: () => void
    }) => (
        <button
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent focus loss
                if (onClick) onClick();
                else if (command) exec(command, arg);
            }}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center flex-shrink-0 min-w-[32px] min-h-[32px] ${
                isActive 
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title={title}
            aria-label={title}
        >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        </button>
    );

    const ToolbarSelect = ({ 
        options, 
        onChange, 
        defaultValue, 
        width = "w-24",
        label
    }: { 
        options: {name: string, value: string}[], 
        onChange: (val: string) => void, 
        defaultValue?: string,
        width?: string,
        label: string
    }) => (
        <div className={`relative ${width} flex-shrink-0`}>
            <select
                className="w-full bg-transparent text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md py-1.5 pl-2 pr-4 appearance-none focus:outline-none hover:border-indigo-300 transition-colors cursor-pointer"
                onChange={(e) => onChange(e.target.value)}
                value={defaultValue}
                aria-label={label}
                onMouseDown={(e) => e.stopPropagation()} // Allow clicking select without losing editor focus logic issues
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-1 top-2 text-slate-400 pointer-events-none" />
        </div>
    );

    const Divider = () => <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 self-center flex-shrink-0" />;

    return (
        <div className={`flex flex-col relative group ${className}`} style={style}>
            
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif, image/webp" 
                onChange={handleFileUpload} 
            />

            {!hideToolbar && (
                <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 p-1.5 rounded-t-xl select-none shadow-sm transition-all">

                    {/* Main Toolbar - Wrap on mobile, single row on desktop */}
                    {!inputMode ? (
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 sm:overflow-x-auto no-scrollbar w-full">
                            {/* Undo/Redo */}
                            <div className="flex gap-0.5 mr-1 flex-shrink-0">
                                <ToolbarButton icon={Undo} command="undo" title="Undo" />
                                <ToolbarButton icon={Redo} command="redo" title="Redo" />
                            </div>
                            
                            <Divider />

                            {/* Font Controls */}
                            <div className="flex gap-1 items-center flex-shrink-0">
                                <ToolbarSelect 
                                    label="Font Family"
                                    options={FONTS} 
                                    onChange={(val) => exec('fontName', val)} 
                                    defaultValue="Inter"
                                    width="w-24"
                                />
                                <ToolbarSelect 
                                    label="Font Size"
                                    options={SIZES} 
                                    onChange={(val) => exec('fontSize', val)} 
                                    defaultValue="3"
                                    width="w-16"
                                />
                            </div>

                            <Divider />

                            {/* Typography */}
                            <div className="flex gap-0.5 flex-shrink-0">
                                <ToolbarButton icon={Bold} command="bold" isActive={activeFormats.includes('bold')} title="Bold" />
                                <ToolbarButton icon={Italic} command="italic" isActive={activeFormats.includes('italic')} title="Italic" />
                                <ToolbarButton icon={Underline} command="underline" isActive={activeFormats.includes('underline')} title="Underline" />
                                <ToolbarButton icon={Strikethrough} command="strikethrough" isActive={activeFormats.includes('strikethrough')} title="Strikethrough" />
                            </div>

                            <Divider />

                            {/* Alignment */}
                            <div className="flex gap-0.5 flex-shrink-0">
                                <ToolbarButton icon={AlignLeft} command="justifyLeft" isActive={activeFormats.includes('left')} title="Align Left" />
                                <ToolbarButton icon={AlignCenter} command="justifyCenter" isActive={activeFormats.includes('center')} title="Align Center" />
                                <ToolbarButton icon={AlignRight} command="justifyRight" isActive={activeFormats.includes('right')} title="Align Right" />
                            </div>

                            <Divider />

                            {/* Lists */}
                            <div className="flex gap-0.5 flex-shrink-0">
                                <ToolbarButton icon={List} command="insertUnorderedList" isActive={activeFormats.includes('ul')} title="Bullet List" />
                                <ToolbarButton icon={ListOrdered} command="insertOrderedList" isActive={activeFormats.includes('ol')} title="Numbered List" />
                            </div>

                            <Divider />

                            {/* Inserts */}
                            <div className="flex gap-0.5 flex-shrink-0">
                                <ToolbarButton icon={LinkIcon} onClick={() => openInput('link')} title="Insert Link" />
                                <ToolbarButton icon={ImageIcon} onClick={() => openInput('image')} title="Insert Image" />
                            </div>

                            {/* AI Action */}
                            <div className="ml-auto flex items-center pl-2 flex-shrink-0 sticky right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                                <button
                                    onMouseDown={(e) => { e.preventDefault(); handleRefine("Fix spelling and grammar"); }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md text-xs font-bold transition-all hover:shadow-md whitespace-nowrap"
                                    title="AI Magic Fix"
                                    aria-label="AI Magic Fix"
                                    disabled={isRefining}
                                >
                                    {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                    <span className="hidden md:inline">Magic Fix</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Input Mode Toolbar */
                        <div className="flex items-center gap-2 px-2 py-0.5 w-full animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wide mr-2 flex-shrink-0">
                                {inputMode === 'link' ? <LinkIcon size={16}/> : <ImageIcon size={16}/>}
                                <span className="hidden sm:inline">{inputMode === 'link' ? 'Link' : 'Image'}</span>
                            </div>
                            <input
                                autoFocus
                                type="text"
                                aria-label={inputMode === 'link' ? "Link URL" : "Image URL"}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 min-w-[50px]"
                                placeholder={inputMode === 'link' ? "https://..." : "https://... or upload"}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') applyInput(); else if (e.key === 'Escape') closeInput(); }}
                            />
                            
                            {/* NEW: Combined Upload Button for Images */}
                            {inputMode === 'image' && (
                                <button 
                                    onMouseDown={(e) => { e.preventDefault(); triggerFileUpload(); }} 
                                    className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-400 rounded-md transition-colors flex-shrink-0" 
                                    title="Upload Local Image"
                                    aria-label="Upload Local Image"
                                >
                                    <Upload size={18} />
                                </button>
                            )}

                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1 flex-shrink-0"></div>

                            <button onMouseDown={(e) => { e.preventDefault(); applyInput(); }} aria-label="Confirm" className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex-shrink-0"><Check size={18}/></button>
                            <button onMouseDown={(e) => { e.preventDefault(); closeInput(); }} aria-label="Cancel" className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-colors flex-shrink-0"><X size={18}/></button>
                        </div>
                    )}
                </div>
            )}

            {/* Editor Area */}
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onBlur={handleBlur}
                className="flex-1 p-6 md:p-8 outline-none text-base leading-relaxed rich-text-content text-slate-900 dark:text-slate-100 min-h-[inherit]"
                style={style}
                data-placeholder={placeholder}
                aria-label="Rich Text Editor"
                suppressContentEditableWarning={true}
            />
            
            {/* Placeholder Overlay - Updated logic to handle empty HTML states */}
            {(isEmpty(value) && placeholder) && (
                <div className="absolute top-[60px] left-6 md:left-8 text-slate-300 pointer-events-none select-none italic text-lg">
                    {placeholder}
                </div>
            )}

            {/* Integrated Stats Footer */}
            {showStats && stats && (
                <div className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-end gap-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 z-10">
                    <span>{stats.words} words</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>{stats.chars} chars</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>~{stats.readTime} min read</span>
                </div>
            )}

            {/* Floating AI Menu (Fixed Side Position) */}
            {floatingPos && !inputMode && (
                <div 
                    className="fixed right-4 z-50 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 gap-2 animate-in slide-in-from-right-2 duration-300 flex flex-col w-40"
                    style={{ 
                        top: Math.max(80, floatingPos.top - 10), 
                    }}
                    onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
                >
                    <div className="px-2 pb-2 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center gap-2">
                        <Sparkles size={12} className="text-indigo-600" /> AI Actions
                    </div>
                    
                    {isRefining ? (
                        <div className="flex items-center justify-center py-4 text-indigo-600">
                            <Loader2 size={20} className="animate-spin"/>
                        </div>
                    ) : (
                        <>
                            <button onClick={() => { saveSelection(); handleRefine("Fix grammar and spelling"); }} className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors">Fix Grammar</button>
                            <button onClick={() => { saveSelection(); handleRefine("Make it shorter and concise"); }} className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors">Shorten</button>
                            <button onClick={() => { saveSelection(); handleRefine("Improve clarity and flow"); }} className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors">Improve</button>
                            <button onClick={() => { saveSelection(); handleRefine("Make it more professional"); }} className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors">Professional</button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
});

export default RichTextEditor;
