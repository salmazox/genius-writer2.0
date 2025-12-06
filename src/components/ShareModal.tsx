
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Forms';
import { Copy, Globe, Lock, Mail, UserPlus, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { SavedDocument, ShareSettings } from '../types';
import { documentService } from '../services/documentService';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: SavedDocument;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, document }) => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');
    
    // Local state for settings to allow "Save" later, or auto-save.
    // We'll auto-save changes for better UX here.
    const [settings, setSettings] = useState<ShareSettings>(document.shareSettings || {
        isPublic: false,
        publicPermission: 'view',
        invitedUsers: []
    });

    const updateSettings = (newSettings: ShareSettings) => {
        setSettings(newSettings);
        documentService.updateShareSettings(document.id, newSettings);
    };

    const handleInvite = () => {
        if (!email.includes('@')) {
            showToast("Please enter a valid email", "error");
            return;
        }
        const newInvites = [
            ...settings.invitedUsers,
            { email, permission }
        ];
        updateSettings({ ...settings, invitedUsers: newInvites });
        setEmail('');
        showToast(`Invite sent to ${email}`, "success");
    };

    const removeUser = (emailToRemove: string) => {
        const newInvites = settings.invitedUsers.filter(u => u.email !== emailToRemove);
        updateSettings({ ...settings, invitedUsers: newInvites });
    };

    const handleCopyLink = () => {
        // Simulate a shareable link
        const url = `${window.location.origin}/share/${document.id}`;
        navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard", "success");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Document">
            <div className="space-y-6">
                {/* Public Link Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${settings.isPublic ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                {settings.isPublic ? <Globe size={20} /> : <Lock size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">General Access</h4>
                                <p className="text-xs text-slate-500">
                                    {settings.isPublic ? "Anyone with the link can view" : "Only invited people can access"}
                                </p>
                            </div>
                        </div>
                        <select 
                            value={settings.isPublic ? 'public' : 'restricted'}
                            onChange={(e) => updateSettings({ ...settings, isPublic: e.target.value === 'public' })}
                            className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="restricted">Restricted</option>
                            <option value="public">Anyone with link</option>
                        </select>
                    </div>

                    {settings.isPublic && (
                         <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-top-1">
                             <input
                                readOnly
                                value={`${window.location.origin}/share/${document.id}`}
                                className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-500"
                             />
                             <Button size="sm" variant="secondary" onClick={handleCopyLink} icon={Copy}>Copy</Button>
                         </div>
                    )}
                </div>

                {/* Invite Section */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Invite People</h4>
                    <div className="flex gap-2 mb-4">
                        <Input 
                            placeholder="Add email address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                            containerClassName="flex-1"
                        />
                        <select 
                            value={permission}
                            onChange={(e) => setPermission(e.target.value as any)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="view">Can view</option>
                            <option value="comment">Can comment</option>
                            <option value="edit">Can edit</option>
                        </select>
                        <Button onClick={handleInvite} icon={UserPlus}>Invite</Button>
                    </div>

                    {/* User List */}
                    <div className="space-y-3">
                        {settings.invitedUsers.length === 0 && (
                            <p className="text-sm text-slate-400 italic text-center py-2">No one invited yet.</p>
                        )}
                        {settings.invitedUsers.map(user => (
                            <div key={user.email} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                                        <p className="text-xs text-slate-500 capitalize">{user.permission}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeUser(user.email)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
