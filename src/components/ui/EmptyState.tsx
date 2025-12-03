/**
 * Empty State Components
 *
 * User-friendly messages and visuals when there's no content to display
 */

import React from 'react';
import {
  FileText,
  Search,
  Inbox,
  FolderOpen,
  AlertCircle,
  Cloud,
  Users,
  Star,
  Zap,
  PackageX,
  WifiOff,
  Database,
  LucideIcon
} from 'lucide-react';

interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Generic Empty State Component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'md'
}) => {
  const sizes = {
    sm: {
      container: 'p-6',
      icon: 32,
      iconContainer: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm'
    },
    md: {
      container: 'p-8',
      icon: 48,
      iconContainer: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-base'
    },
    lg: {
      container: 'p-12',
      icon: 64,
      iconContainer: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-lg'
    }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeConfig.container} ${className}`}>
      {/* Icon */}
      <div className={`${sizeConfig.iconContainer} rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4`}>
        <Icon size={sizeConfig.icon} className="text-slate-400 dark:text-slate-500" />
      </div>

      {/* Title */}
      <h3 className={`font-bold text-slate-900 dark:text-white mb-2 ${sizeConfig.title}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`text-slate-600 dark:text-slate-400 max-w-md mb-6 ${sizeConfig.description}`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                action.variant === 'secondary'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
              }`}
            >
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-2 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * No Documents Empty State
 */
export const NoDocumentsState: React.FC<{
  onCreateDocument?: () => void;
  onBrowseTemplates?: () => void;
}> = ({ onCreateDocument, onBrowseTemplates }) => {
  return (
    <EmptyState
      icon={FileText}
      title="No documents yet"
      description="Start creating amazing content with AI. Choose a template to get started."
      action={
        onCreateDocument
          ? {
              label: 'Create Document',
              onClick: onCreateDocument
            }
          : undefined
      }
      secondaryAction={
        onBrowseTemplates
          ? {
              label: 'Browse Templates',
              onClick: onBrowseTemplates
            }
          : undefined
      }
    />
  );
};

/**
 * No Search Results Empty State
 */
export const NoSearchResultsState: React.FC<{
  searchQuery?: string;
  onClearSearch?: () => void;
}> = ({ searchQuery, onClearSearch }) => {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        searchQuery
          ? `We couldn't find anything matching "${searchQuery}". Try different keywords or clear your search.`
          : "We couldn't find any results. Try adjusting your search terms."
      }
      action={
        onClearSearch
          ? {
              label: 'Clear Search',
              onClick: onClearSearch,
              variant: 'secondary'
            }
          : undefined
      }
    />
  );
};

/**
 * Empty Folder State
 */
export const EmptyFolderState: React.FC<{
  folderName?: string;
  onAddDocument?: () => void;
}> = ({ folderName, onAddDocument }) => {
  return (
    <EmptyState
      icon={FolderOpen}
      title={folderName ? `"${folderName}" is empty` : 'This folder is empty'}
      description="Add documents to this folder to keep your work organized."
      action={
        onAddDocument
          ? {
              label: 'Add Document',
              onClick: onAddDocument
            }
          : undefined
      }
    />
  );
};

/**
 * No Favorites State
 */
export const NoFavoritesState: React.FC<{
  onBrowseTools?: () => void;
}> = ({ onBrowseTools }) => {
  return (
    <EmptyState
      icon={Star}
      title="No favorite tools yet"
      description="Mark tools as favorites for quick access. Click the star icon on any tool card."
      action={
        onBrowseTools
          ? {
              label: 'Browse Tools',
              onClick: onBrowseTools
            }
          : undefined
      }
      size="sm"
    />
  );
};

/**
 * Network Error State
 */
export const NetworkErrorState: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => {
  return (
    <EmptyState
      icon={WifiOff}
      title="Connection lost"
      description="Unable to connect to the server. Please check your internet connection and try again."
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry
            }
          : undefined
      }
    />
  );
};

/**
 * Generic Error State
 */
export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry
}) => {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry
            }
          : undefined
      }
    />
  );
};

/**
 * No Data State (for charts/analytics)
 */
export const NoDataState: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = 'No data available',
  description = 'There is no data to display yet. Start using the app to see insights here.'
}) => {
  return (
    <EmptyState
      icon={Database}
      title={title}
      description={description}
      size="sm"
    />
  );
};

/**
 * No Collaborators State
 */
export const NoCollaboratorsState: React.FC<{
  onInvite?: () => void;
}> = ({ onInvite }) => {
  return (
    <EmptyState
      icon={Users}
      title="No collaborators yet"
      description="Invite team members to collaborate on your documents and projects."
      action={
        onInvite
          ? {
              label: 'Invite Team Members',
              onClick: onInvite
            }
          : undefined
      }
      size="sm"
    />
  );
};

/**
 * Feature Locked State (for premium features)
 */
export const FeatureLockedState: React.FC<{
  featureName?: string;
  onUpgrade?: () => void;
}> = ({ featureName = 'This feature', onUpgrade }) => {
  return (
    <EmptyState
      icon={Zap}
      title={`${featureName} is locked`}
      description="Upgrade to a premium plan to unlock this feature and many more."
      action={
        onUpgrade
          ? {
              label: 'Upgrade Now',
              onClick: onUpgrade
            }
          : undefined
      }
    />
  );
};

/**
 * Coming Soon State
 */
export const ComingSoonState: React.FC<{
  featureName?: string;
}> = ({ featureName = 'This feature' }) => {
  return (
    <EmptyState
      icon={PackageX}
      title="Coming soon"
      description={`${featureName} is currently under development. Stay tuned for updates!`}
      size="sm"
    />
  );
};

/**
 * Offline State
 */
export const OfflineState: React.FC = () => {
  return (
    <EmptyState
      icon={Cloud}
      title="You're offline"
      description="Some features may not be available while you're offline. Your work is saved locally and will sync when you reconnect."
      size="sm"
    />
  );
};
