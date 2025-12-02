import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Settings, Moon, Sun, Globe, Plus, Home, User, Command, Clock, ArrowRight } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useUser } from '../contexts/UserContext';
import { documentService } from '../services/documentService';
import { SavedDocument } from '../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CommandItem {
    id: string;
    label: string;
    icon: React.ElementType;
    shortcut?: string[];
    action: () => void;
    group: 'Navigation' | 'Actions' | 'Recent';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();
    const { user } = useUser();
    
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [recentDocs, setRecentDocs] = useState<SavedDocument[]>([]);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Fetch recents when opening
    useEffect(() => {
        if (isOpen) {
            const docs = documentService.getAll();
            setRecentDocs(docs.sort((a, b) => b.lastModified - a.lastModified).slice(0, 3));
            setSearch('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Define Commands
    const commands: CommandItem[] = [
        // Navigation
        { id: 'nav-home', label: 'Go to Dashboard', group: 'Navigation', icon: Home, action: () => navigate('/dashboard') },
        { id: 'nav-profile', label: 'Go to Profile', group: 'Navigation', icon: User, action: () => navigate('/user-dashboard') },
        { id: 'nav-pricing', label: 'Go to Pricing', group: 'Navigation', icon: FileText, action: () => navigate('/pricing') },
        
        // Actions
        { id: 'act-new', label: 'Create New Document', group: 'Actions', icon: Plus, shortcut: ['C'], action: () => { navigate('/dashboard'); /* Logic to open tool picker could go here */ } },
        { id: 'act-theme', label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, group: 'Actions', icon: theme === 'light' ? Moon : Sun, action: toggleTheme },
        { id: 'act-lang', label: `Switch to ${language === 'en' ? 'German' : 'English'}`, group: 'Actions', icon: Globe, action: () => setLanguage(language === 'en' ? 'de' : 'en') },
    ];

    // Add Recents dynamically
    const recentCommands: CommandItem[] = recentDocs.map(doc => ({
        id: `recent-${doc.id}`,
        label: doc.title,
        group: 'Recent',
        icon: Clock,
        action: () => {
            // Logic to open doc - navigating to dashboard and setting active tool/doc is complex here without context
            // For now, we go to dashboard. Ideally, we pass a query param or use context.
            navigate('/dashboard'); 
            // In a real app, you'd use a global state manager to set the active document here
        }
    }));

    const allItems = [...commands, ...recentCommands];

    // Filter
    const filteredItems = allItems.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase()) || 
        item.group.toLowerCase().includes(search.toLowerCase())
    );

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[activeIndex]) {
                    filteredItems[activeIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredItems, activeIndex, onClose]);

    // Scroll active into view
    useEffect(() => {
        if (listRef.current) {
            const activeEl = listRef.current.children[activeIndex] as HTMLElement;
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setActiveIndex(0); }}
                        placeholder="Type a command or search..."
                        className="w-full h-14 px-4 bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                    />
                    <div className="hidden sm:flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar" ref={listRef}>
                    {filteredItems.length === 0 ? (
                        <div className="px-4 py-8 text-center text-slate-500 text-sm">
                            No results found for "{search}"
                        </div>
                    ) : (
                        filteredItems.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => { item.action(); onClose(); }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                                    index === activeIndex 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400' 
                                    : 'text-slate-700 dark:text-slate-300 border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className={index === activeIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                                    <div>
                                        <span className="block text-sm font-medium">{item.label}</span>
                                        {item.group === 'Recent' && <span className="text-[10px] text-slate-400 uppercase tracking-wider">Recently Opened</span>}
                                    </div>
                                </div>
                                {item.group !== 'Recent' && index === activeIndex && <ArrowRight size={14} className="opacity-50" />}
                            </button>
                        ))
                    )}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-[10px] text-slate-400 flex justify-between border-t border-slate-100 dark:border-slate-800">
                    <span><strong>↑↓</strong> to navigate</span>
                    <span><strong>Enter</strong> to select</span>
                </div>
            </div>
        </div>
    );
};