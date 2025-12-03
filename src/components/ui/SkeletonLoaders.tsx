/**
 * Specialized Skeleton Loaders
 *
 * Pre-built skeleton components for common UI elements
 */

import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * Tool Card Skeleton
 * Used in Dashboard library when loading tools
 */
export const ToolCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
      <Skeleton variant="rectangular" width={48} height={48} className="mb-4 rounded-xl" />
      <Skeleton variant="text" width="70%" height={24} className="mb-2" />
      <Skeleton variant="text" width="100%" height={16} className="mb-1" />
      <Skeleton variant="text" width="80%" height={16} />
    </div>
  );
};

/**
 * Document Card Skeleton
 * Used in Documents view when loading documents
 */
export const DocumentCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <Skeleton variant="rectangular" width={32} height={32} className="rounded" />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <Skeleton variant="text" width="90%" height={20} className="mb-2" />
      <Skeleton variant="text" width="60%" height={14} className="mb-3" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
        <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
      </div>
    </div>
  );
};

/**
 * Tool Grid Skeleton
 * Used when loading the full tools library
 */
export const ToolGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ToolCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Document Grid Skeleton
 * Used when loading documents
 */
export const DocumentGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <DocumentCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Table Row Skeleton
 * Used in table views
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-800">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="p-4">
          <Skeleton variant="text" width="80%" height={16} />
        </td>
      ))}
    </tr>
  );
};

/**
 * Table Skeleton
 * Full table with header and rows
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="p-4 text-left">
                <Skeleton variant="text" width="60%" height={16} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900">
          {Array.from({ length: rows }).map((_, index) => (
            <TableRowSkeleton key={index} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Form Skeleton
 * Used when loading form inputs
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton variant="text" width="30%" height={14} className="mb-2" />
          <Skeleton variant="rectangular" width="100%" height={40} className="rounded-lg" />
        </div>
      ))}
    </div>
  );
};

/**
 * Article/Content Skeleton
 * Used for blog posts, generated content
 */
export const ContentSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Skeleton variant="text" width="80%" height={32} className="mb-4" />

      {/* Metadata */}
      <div className="flex gap-4 mb-6">
        <Skeleton variant="text" width={120} height={16} />
        <Skeleton variant="text" width={100} height={16} />
      </div>

      {/* Paragraphs */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="90%" height={16} />
        </div>
      ))}

      {/* Image placeholder */}
      <Skeleton variant="rectangular" width="100%" height={200} className="rounded-lg my-6" />

      {/* More paragraphs */}
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="95%" height={16} />
        </div>
      ))}
    </div>
  );
};

/**
 * Profile Card Skeleton
 * Used in user dashboard
 */
export const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={24} className="mb-2" />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
      </div>
    </div>
  );
};

/**
 * Stats Card Skeleton
 * Used for analytics/usage cards
 */
export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
      <Skeleton variant="text" width="50%" height={14} className="mb-4" />
      <Skeleton variant="text" width="40%" height={36} className="mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
        <Skeleton variant="text" width={80} height={14} />
      </div>
    </div>
  );
};

/**
 * Chat Message Skeleton
 * Used in live interview or chat features
 */
export const ChatMessageSkeleton: React.FC<{ isUser?: boolean }> = ({ isUser = false }) => {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="30%" height={14} />
        <Skeleton
          variant="rectangular"
          width="80%"
          height={60}
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

/**
 * List Item Skeleton
 * Generic list item
 */
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-800">
      <Skeleton variant="circular" width={32} height={32} />
      <div className="flex-1">
        <Skeleton variant="text" width="70%" height={16} className="mb-1" />
        <Skeleton variant="text" width="40%" height={14} />
      </div>
    </div>
  );
};

/**
 * Sidebar Skeleton
 * Used for navigation sidebars
 */
export const SidebarSkeleton: React.FC<{ items?: number }> = ({ items = 6 }) => {
  return (
    <div className="space-y-2 p-4">
      <Skeleton variant="text" width="60%" height={20} className="mb-4" />
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <Skeleton variant="rectangular" width={16} height={16} className="rounded" />
          <Skeleton variant="text" width="80%" height={16} />
        </div>
      ))}
    </div>
  );
};

/**
 * Header Skeleton
 * Page header with title and actions
 */
export const HeaderSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Skeleton variant="text" width={200} height={32} className="mb-2" />
        <Skeleton variant="text" width={300} height={16} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={100} height={40} className="rounded-lg" />
        <Skeleton variant="rectangular" width={100} height={40} className="rounded-lg" />
      </div>
    </div>
  );
};
