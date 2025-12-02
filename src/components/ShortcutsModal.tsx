import React from 'react';
import { Modal } from './ui/Modal';
import { Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShortcutRow: React.FC<{ keys: string[], action: string }> = ({ keys, action }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action}</span>
        <div className="flex gap-1">
            {keys.map((k, i) => (
                <kbd key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {k}
                </kbd>
            ))}
        </div>
    </div>
);

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="sm">
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                    <Keyboard size={20} />
                    <span className="font-bold text-sm">Productivity Boosters</span>
                </div>
                
                <div className="space-y-1">
                    <ShortcutRow keys={['Ctrl', 'S']} action="Save Document" />
                    <ShortcutRow keys={['Ctrl', '/']} action="Show Shortcuts" />
                    <ShortcutRow keys={['Ctrl', 'Z']} action="Undo" />
                    <ShortcutRow keys={['Ctrl', 'Shift', 'Z']} action="Redo" />
                    <ShortcutRow keys={['Ctrl', 'B']} action="Bold Text" />
                    <ShortcutRow keys={['Ctrl', 'I']} action="Italic Text" />
                </div>
                
                <p className="text-xs text-slate-400 mt-4 text-center">
                    Note: On macOS, use <kbd className="font-bold">Cmd</kbd> instead of <kbd className="font-bold">Ctrl</kbd>.
                </p>
            </div>
        </Modal>
    );
};