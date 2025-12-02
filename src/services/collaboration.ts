/**
 * Collaboration Service
 *
 * Handles team collaboration features including:
 * - Threaded comments with replies
 * - Document sharing with permissions
 * - Activity tracking
 * - User mentions
 */

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
}

export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  parentId?: string; // For threaded replies
  mentions: string[]; // User IDs mentioned in comment
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}

export interface ShareLink {
  id: string;
  documentId: string;
  createdBy: string;
  token: string;
  permission: 'view' | 'comment' | 'edit';
  expiresAt?: Date;
  password?: string;
  createdAt: Date;
  accessCount: number;
}

export interface Activity {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  type: 'create' | 'edit' | 'comment' | 'share' | 'resolve';
  description: string;
  timestamp: Date;
}

const COMMENTS_STORAGE_KEY = 'genius_comments';
const SHARE_LINKS_STORAGE_KEY = 'genius_share_links';
const ACTIVITY_STORAGE_KEY = 'genius_activity';

/**
 * Get all comments for a document
 */
export function getComments(documentId: string): Comment[] {
  const commentsJson = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!commentsJson) return [];

  const allComments: Comment[] = JSON.parse(commentsJson);
  return allComments
    .filter(c => c.documentId === documentId && !c.parentId)
    .map(comment => ({
      ...comment,
      createdAt: new Date(comment.createdAt),
      updatedAt: new Date(comment.updatedAt),
      replies: allComments
        .filter(r => r.parentId === comment.id)
        .map(r => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt)
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Add a new comment
 */
export function addComment(
  documentId: string,
  userId: string,
  userName: string,
  content: string,
  options?: {
    userAvatar?: string;
    selection?: Comment['selection'];
    parentId?: string;
  }
): Comment {
  const commentsJson = localStorage.getItem(COMMENTS_STORAGE_KEY);
  const allComments: Comment[] = commentsJson ? JSON.parse(commentsJson) : [];

  // Extract mentions (@username)
  const mentions = extractMentions(content);

  const newComment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    documentId,
    userId,
    userName,
    userAvatar: options?.userAvatar,
    content,
    selection: options?.selection,
    parentId: options?.parentId,
    mentions,
    resolved: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  allComments.push(newComment);
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  // Log activity
  logActivity(documentId, userId, userName, 'comment', `Added a ${options?.parentId ? 'reply' : 'comment'}`);

  return newComment;
}

/**
 * Update a comment
 */
export function updateComment(commentId: string, content: string): Comment | null {
  const commentsJson = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!commentsJson) return null;

  const allComments: Comment[] = JSON.parse(commentsJson);
  const comment = allComments.find(c => c.id === commentId);

  if (!comment) return null;

  comment.content = content;
  comment.mentions = extractMentions(content);
  comment.updatedAt = new Date();

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  return comment;
}

/**
 * Delete a comment
 */
export function deleteComment(commentId: string): boolean {
  const commentsJson = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!commentsJson) return false;

  let allComments: Comment[] = JSON.parse(commentsJson);
  const initialLength = allComments.length;

  // Delete comment and all its replies
  allComments = allComments.filter(c => c.id !== commentId && c.parentId !== commentId);

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  return allComments.length < initialLength;
}

/**
 * Resolve/unresolve a comment thread
 */
export function toggleCommentResolution(commentId: string): boolean {
  const commentsJson = localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!commentsJson) return false;

  const allComments: Comment[] = JSON.parse(commentsJson);
  const comment = allComments.find(c => c.id === commentId);

  if (!comment) return false;

  comment.resolved = !comment.resolved;
  comment.updatedAt = new Date();

  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

  // Log activity
  logActivity(
    comment.documentId,
    comment.userId,
    comment.userName,
    'resolve',
    comment.resolved ? 'Resolved a comment' : 'Reopened a comment'
  );

  return comment.resolved;
}

/**
 * Extract @mentions from comment content
 */
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

/**
 * Create a shareable link
 */
export function createShareLink(
  documentId: string,
  createdBy: string,
  permission: ShareLink['permission'],
  options?: {
    expiresIn?: number; // milliseconds
    password?: string;
  }
): ShareLink {
  const shareLinksJson = localStorage.getItem(SHARE_LINKS_STORAGE_KEY);
  const allLinks: ShareLink[] = shareLinksJson ? JSON.parse(shareLinksJson) : [];

  const token = generateToken();
  const expiresAt = options?.expiresIn ? new Date(Date.now() + options.expiresIn) : undefined;

  const shareLink: ShareLink = {
    id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    documentId,
    createdBy,
    token,
    permission,
    expiresAt,
    password: options?.password,
    createdAt: new Date(),
    accessCount: 0
  };

  allLinks.push(shareLink);
  localStorage.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(allLinks));

  // Log activity
  logActivity(documentId, createdBy, 'User', 'share', `Created a ${permission} link`);

  return shareLink;
}

/**
 * Get share links for a document
 */
export function getShareLinks(documentId: string): ShareLink[] {
  const shareLinksJson = localStorage.getItem(SHARE_LINKS_STORAGE_KEY);
  if (!shareLinksJson) return [];

  const allLinks: ShareLink[] = JSON.parse(shareLinksJson);
  return allLinks
    .filter(link => link.documentId === documentId)
    .map(link => ({
      ...link,
      createdAt: new Date(link.createdAt),
      expiresAt: link.expiresAt ? new Date(link.expiresAt) : undefined
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Revoke a share link
 */
export function revokeShareLink(linkId: string): boolean {
  const shareLinksJson = localStorage.getItem(SHARE_LINKS_STORAGE_KEY);
  if (!shareLinksJson) return false;

  let allLinks: ShareLink[] = JSON.parse(shareLinksJson);
  const initialLength = allLinks.length;

  allLinks = allLinks.filter(link => link.id !== linkId);

  localStorage.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(allLinks));

  return allLinks.length < initialLength;
}

/**
 * Validate and access share link
 */
export function accessShareLink(token: string, password?: string): ShareLink | null {
  const shareLinksJson = localStorage.getItem(SHARE_LINKS_STORAGE_KEY);
  if (!shareLinksJson) return null;

  const allLinks: ShareLink[] = JSON.parse(shareLinksJson);
  const link = allLinks.find(l => l.token === token);

  if (!link) return null;

  // Check expiration
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return null;
  }

  // Check password
  if (link.password && link.password !== password) {
    return null;
  }

  // Increment access count
  link.accessCount++;
  localStorage.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(allLinks));

  return {
    ...link,
    createdAt: new Date(link.createdAt),
    expiresAt: link.expiresAt ? new Date(link.expiresAt) : undefined
  };
}

/**
 * Generate a random token for share links
 */
function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');
}

/**
 * Log activity
 */
export function logActivity(
  documentId: string,
  userId: string,
  userName: string,
  type: Activity['type'],
  description: string
): void {
  const activityJson = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  const allActivity: Activity[] = activityJson ? JSON.parse(activityJson) : [];

  const activity: Activity = {
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    documentId,
    userId,
    userName,
    type,
    description,
    timestamp: new Date()
  };

  allActivity.push(activity);

  // Keep only last 100 activities per document
  const documentActivities = allActivity
    .filter(a => a.documentId === documentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 100);

  const otherActivities = allActivity.filter(a => a.documentId !== documentId);

  localStorage.setItem(
    ACTIVITY_STORAGE_KEY,
    JSON.stringify([...documentActivities, ...otherActivities])
  );
}

/**
 * Get activity for a document
 */
export function getActivity(documentId: string, limit: number = 20): Activity[] {
  const activityJson = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (!activityJson) return [];

  const allActivity: Activity[] = JSON.parse(activityJson);
  return allActivity
    .filter(a => a.documentId === documentId)
    .map(a => ({
      ...a,
      timestamp: new Date(a.timestamp)
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Get comment count for a document
 */
export function getCommentCount(documentId: string): {
  total: number;
  resolved: number;
  unresolved: number;
} {
  const comments = getComments(documentId);
  const total = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
  const resolved = comments.filter(c => c.resolved).length;

  return {
    total,
    resolved,
    unresolved: total - resolved
  };
}

/**
 * Format time ago
 */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

export default {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentResolution,
  createShareLink,
  getShareLinks,
  revokeShareLink,
  accessShareLink,
  logActivity,
  getActivity,
  getCommentCount,
  timeAgo
};
