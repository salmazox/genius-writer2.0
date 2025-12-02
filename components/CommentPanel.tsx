/**
 * Comment Panel Component
 *
 * Displays threaded comments with replies, mentions, and resolution status.
 * Fully mobile-responsive with touch-friendly interface.
 */

import React, { useState, useMemo } from 'react';
import { MessageCircle, Send, Edit2, Trash2, Check, X, MoreVertical, Reply, CheckCircle } from 'lucide-react';
import {
  Comment,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentResolution,
  timeAgo
} from '../services/collaboration';

interface CommentPanelProps {
  documentId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  onClose?: () => void;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  onReply: (parentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onResolve: (commentId: string) => void;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  isReply = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isOwner = comment.userId === currentUserId;

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={`${isReply ? 'ml-8 md:ml-12' : ''} mb-4`}>
      <div className={`rounded-lg border ${comment.resolved ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'} p-3 md:p-4`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Avatar */}
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs md:text-sm flex-shrink-0">
              {comment.userAvatar ? (
                <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                comment.userName.charAt(0).toUpperCase()
              )}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 text-sm md:text-base truncate">
                  {comment.userName}
                </span>
                {comment.resolved && !isReply && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full flex-shrink-0">
                    <CheckCircle size={12} />
                    Resolved
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <MoreVertical size={16} className="text-slate-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                {!isReply && (
                  <button
                    onClick={() => {
                      onResolve(comment.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <CheckCircle size={14} />
                    {comment.resolved ? 'Reopen' : 'Resolve'}
                  </button>
                )}
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(comment.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              placeholder="Edit your comment..."
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
              >
                <Check size={14} />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-1"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-700 text-sm md:text-base mb-2 whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            {/* Selection Context */}
            {comment.selection && (
              <div className="mt-2 p-2 bg-amber-50 border-l-4 border-amber-400 rounded text-xs md:text-sm">
                <div className="text-amber-800 font-medium mb-1">💬 Commented on:</div>
                <div className="text-amber-700 italic">"{comment.selection.text}"</div>
              </div>
            )}

            {/* Reply Button */}
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="mt-2 text-xs md:text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <Reply size={14} />
                Reply
              </button>
            )}
          </>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <ReplyForm
          parentId={comment.id}
          currentUserName={currentUserName}
          currentUserId={currentUserId}
          currentUserAvatar={currentUserAvatar}
          documentId={comment.documentId}
          onSuccess={() => setShowReplyForm(false)}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onResolve={onResolve}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ReplyFormProps {
  parentId: string;
  currentUserName: string;
  currentUserId: string;
  currentUserAvatar?: string;
  documentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  parentId,
  currentUserName,
  currentUserId,
  currentUserAvatar,
  documentId,
  onSuccess,
  onCancel
}) => {
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      addComment(documentId, currentUserId, currentUserName, replyContent.trim(), {
        userAvatar: currentUserAvatar,
        parentId
      });
      setReplyContent('');
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ml-8 md:ml-12 mt-2">
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
        placeholder="Write a reply..."
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="submit"
          disabled={!replyContent.trim()}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Send size={14} />
          Reply
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export const CommentPanel: React.FC<CommentPanelProps> = ({
  documentId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onClose
}) => {
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Get comments
  const allComments = useMemo(() => {
    return getComments(documentId);
  }, [documentId, refreshKey]);

  // Filter comments
  const filteredComments = useMemo(() => {
    if (filter === 'all') return allComments;
    if (filter === 'unresolved') return allComments.filter(c => !c.resolved);
    if (filter === 'resolved') return allComments.filter(c => c.resolved);
    return allComments;
  }, [allComments, filter]);

  // Stats
  const stats = useMemo(() => {
    const total = allComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
    const resolved = allComments.filter(c => c.resolved).length;
    return { total, resolved, unresolved: allComments.length - resolved };
  }, [allComments]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(documentId, currentUserId, currentUserName, newComment.trim(), {
        userAvatar: currentUserAvatar
      });
      setNewComment('');
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleReply = (parentId: string) => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (commentId: string, content: string) => {
    updateComment(commentId, content);
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment(commentId);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleResolve = (commentId: string) => {
    toggleCommentResolution(commentId);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 bg-slate-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-indigo-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Comments</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded transition-colors lg:hidden"
            >
              <X size={20} className="text-slate-600" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs md:text-sm">
          <span className="text-slate-600">
            <span className="font-semibold text-slate-900">{stats.total}</span> total
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">
            <span className="font-semibold text-amber-600">{stats.unresolved}</span> open
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">
            <span className="font-semibold text-green-600">{stats.resolved}</span> resolved
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              filter === 'unresolved'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Open ({stats.unresolved})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              filter === 'resolved'
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Resolved ({stats.resolved})
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm md:text-base">
              {filter === 'all'
                ? 'No comments yet. Be the first to comment!'
                : filter === 'unresolved'
                ? 'No open comments'
                : 'No resolved comments'}
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onResolve={handleResolve}
            />
          ))
        )}
      </div>

      {/* New Comment Form */}
      <div className="border-t border-slate-200 p-4 bg-slate-50 flex-shrink-0">
        <form onSubmit={handleAddComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Add a comment... (use @username to mention)"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">
              Tip: Use <span className="font-mono bg-slate-200 px-1 rounded">@username</span> to mention someone
            </span>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Comment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentPanel;
