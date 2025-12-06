/**
 * Collaboration Share Modal Component
 *
 * Creates and manages share links with tokens, permissions, and expiration.
 * Uses the collaboration service for token-based sharing.
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, Trash2, Link2, Calendar, Lock, Eye, MessageCircle, Edit2, Globe } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import {
  createShareLink,
  getShareLinks,
  revokeShareLink,
  ShareLink
} from '../services/collaboration';

interface CollaborationShareModalProps {
  documentId: string;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CollaborationShareModal: React.FC<CollaborationShareModalProps> = ({
  documentId,
  currentUserId,
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const { t } = useThemeLanguage();

  // Form state
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');
  const [expirationDays, setExpirationDays] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Share links state
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load share links
  useEffect(() => {
    if (isOpen) {
      const links = getShareLinks(documentId);
      setShareLinks(links);
    }
  }, [documentId, isOpen, refreshKey]);

  const handleGenerateLink = () => {
    if (!documentId || !currentUserId) {
      showToast(t('ui.share.collaboration.invalidDoc'), 'error');
      return;
    }

    // Calculate expiration
    const expiresIn = expirationDays
      ? parseInt(expirationDays) * 24 * 60 * 60 * 1000
      : undefined;

    // Create share link
    const newLink = createShareLink(documentId, currentUserId, permission, {
      expiresIn,
      password: password.trim() || undefined
    });

    // Refresh list
    setRefreshKey(prev => prev + 1);

    // Reset form
    setPermission('view');
    setExpirationDays('');
    setPassword('');

    showToast(t('ui.share.collaboration.linkCreated'), 'success');
  };

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/shared/${token}`;

    try {
      await navigator.clipboard.writeText(url);
      showToast(t('ui.share.linkCopied'), 'success');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast(t('ui.share.collaboration.copyFailed'), 'error');
    }
  };

  const handleRevokeLink = (linkId: string) => {
    if (confirm(t('ui.share.collaboration.confirmRevoke'))) {
      const success = revokeShareLink(linkId);
      if (success) {
        showToast(t('ui.share.collaboration.linkRevoked'), 'success');
        setRefreshKey(prev => prev + 1);
      } else {
        showToast(t('ui.share.collaboration.revokeFailed'), 'error');
      }
    }
  };

  const getPermissionIcon = (perm: 'view' | 'comment' | 'edit') => {
    switch (perm) {
      case 'view':
        return <Eye size={14} className="text-blue-600" />;
      case 'comment':
        return <MessageCircle size={14} className="text-purple-600" />;
      case 'edit':
        return <Edit2 size={14} className="text-green-600" />;
    }
  };

  const getPermissionBadgeClass = (perm: 'view' | 'comment' | 'edit') => {
    switch (perm) {
      case 'view':
        return 'bg-blue-100 text-blue-700';
      case 'comment':
        return 'bg-purple-100 text-purple-700';
      case 'edit':
        return 'bg-green-100 text-green-700';
    }
  };

  const formatExpirationDate = (date?: Date) => {
    if (!date) return t('ui.share.collaboration.never');
    const now = new Date();
    if (date < now) return t('ui.share.collaboration.expired');

    const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 1) return t('ui.share.collaboration.day');
    if (days < 7) return t('ui.share.collaboration.days').replace('{count}', String(days));
    if (days < 30) return t('ui.share.collaboration.weeks').replace('{count}', String(Math.ceil(days / 7)));
    return t('ui.share.collaboration.months').replace('{count}', String(Math.ceil(days / 30)));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('ui.share.title')}>
      <div className="space-y-6">
        {/* Create Share Link Form */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Link2 size={20} className="text-indigo-600" />
            {t('ui.share.collaboration.createNew')}
          </h3>

          {/* Permission Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('ui.share.collaboration.permissionLevel')}
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'comment' | 'edit')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="view">{t('ui.share.permissions.canView')}</option>
              <option value="comment">{t('ui.share.permissions.canComment')}</option>
              <option value="edit">{t('ui.share.permissions.canEdit')}</option>
            </select>
          </div>

          {/* Expiration (Optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              {t('ui.share.collaboration.expiration')}
            </label>
            <input
              type="number"
              value={expirationDays}
              onChange={(e) => setExpirationDays(e.target.value)}
              placeholder={t('ui.share.collaboration.daysPlaceholder')}
              min="1"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">{t('ui.share.collaboration.noExpiration')}</p>
          </div>

          {/* Password (Optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Lock size={16} />
              {t('ui.share.collaboration.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('ui.share.collaboration.passwordPlaceholder')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">{t('ui.share.collaboration.passwordHint')}</p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateLink}
            className="w-full"
            icon={Globe}
          >
            {t('ui.share.collaboration.generateLink')}
          </Button>
        </div>

        {/* Existing Share Links */}
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3">
            {t('ui.share.collaboration.activeLinks')}
          </h3>

          {shareLinks.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <Link2 size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('ui.share.collaboration.noLinks')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {shareLinks.map((link) => (
                <div
                  key={link.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 md:p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  {/* Link Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Permission Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPermissionBadgeClass(link.permission)}`}>
                        {getPermissionIcon(link.permission)}
                        {link.permission}
                      </span>

                      {/* Password Indicator */}
                      {link.password && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Lock size={12} />
                          {t('ui.share.collaboration.protected')}
                        </span>
                      )}

                      {/* Expiration Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        link.expiresAt && link.expiresAt < new Date()
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        <Calendar size={12} />
                        {formatExpirationDate(link.expiresAt)}
                      </span>
                    </div>
                  </div>

                  {/* Link URL */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <code className="flex-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                        {`${window.location.origin}${window.location.pathname}#/shared/${link.token.substring(0, 16)}...`}
                      </code>
                    </div>
                  </div>

                  {/* Link Stats & Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium">{link.accessCount}</span> {link.accessCount !== 1 ? t('ui.share.collaboration.accesses') : t('ui.share.collaboration.access')}
                      {' • '}
                      {t('ui.share.collaboration.created')} {new Date(link.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyLink(link.token)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                        title={t('ui.share.copy')}
                      >
                        <Copy size={14} />
                        <span className="hidden sm:inline">{t('ui.share.copy')}</span>
                      </button>

                      {/* Revoke Button */}
                      <button
                        onClick={() => handleRevokeLink(link.id)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                        title={t('ui.share.collaboration.revoke')}
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">{t('ui.share.collaboration.revoke')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CollaborationShareModal;
