/**
 * Document Outline Component
 *
 * Displays and manages hierarchical document structure with drag-and-drop reordering.
 * Supports expand/collapse, section navigation, and progress tracking.
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Check,
  X,
  FileText,
  Target,
  MoreVertical
} from 'lucide-react';
import {
  getOutline,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  calculateProgress,
  OutlineSection,
  DocumentOutline as DocumentOutlineType
} from '../services/documentOutliner';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface DocumentOutlineProps {
  documentId: string;
  onSectionClick?: (section: OutlineSection) => void;
  onClose?: () => void;
}

interface SectionItemProps {
  section: OutlineSection;
  documentId: string;
  allSections: OutlineSection[];
  onSectionClick?: (section: OutlineSection) => void;
  onUpdate: () => void;
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  documentId,
  allSections,
  onSectionClick,
  onUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [showMenu, setShowMenu] = useState(false);

  // Find child sections
  const childSections = allSections
    .filter(s => s.parentId === section.id)
    .sort((a, b) => a.order - b.order);

  const hasChildren = childSections.length > 0;

  const handleSave = () => {
    if (editTitle.trim()) {
      updateSection(documentId, section.id, { title: editTitle.trim() });
      setIsEditing(false);
      onUpdate();
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete "${section.title}" and all its subsections?`)) {
      deleteSection(documentId, section.id);
      onUpdate();
    }
  };

  const handleStatusChange = (status: OutlineSection['status']) => {
    updateSection(documentId, section.id, { status });
    setShowMenu(false);
    onUpdate();
  };

  const getStatusColor = (status: OutlineSection['status']) => {
    switch (status) {
      case 'planning':
        return 'text-slate-500';
      case 'in-progress':
        return 'text-amber-500';
      case 'complete':
        return 'text-green-500';
    }
  };

  const getStatusBg = (status: OutlineSection['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-slate-100 dark:bg-slate-800';
      case 'in-progress':
        return 'bg-amber-100 dark:bg-amber-900/30';
      case 'complete':
        return 'bg-green-100 dark:bg-green-900/30';
    }
  };

  const progressPercentage = section.wordCountGoal
    ? Math.round((section.wordCount / section.wordCountGoal) * 100)
    : 0;

  return (
    <div className="mb-2">
      <div
        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${
          getStatusBg(section.status)
        }`}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors ${
            !hasChildren ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Drag Handle */}
        <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} className="text-slate-400" />
        </div>

        {/* Section Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') {
                    setEditTitle(section.title);
                    setIsEditing(false);
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setEditTitle(section.title);
                  setIsEditing(false);
                }}
                className="p-1 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => onSectionClick?.(section)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getStatusColor(section.status)}`}>
                  {section.title}
                </span>
                {section.wordCountGoal && (
                  <span className="text-xs text-slate-500">
                    ({section.wordCount} / {section.wordCountGoal} words)
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {section.wordCountGoal && section.wordCountGoal > 0 && (
                <div className="mt-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      progressPercentage >= 100
                        ? 'bg-green-500'
                        : progressPercentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <MoreVertical size={16} className="text-slate-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 min-w-[160px]">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit2 size={14} />
                Edit
              </button>

              <div className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-1">
                Status
              </div>
              <button
                onClick={() => handleStatusChange('planning')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Planning
              </button>
              <button
                onClick={() => handleStatusChange('in-progress')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange('complete')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Complete
              </button>

              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700 mt-1"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Child Sections */}
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-1 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
          {childSections.map((child) => (
            <SectionItem
              key={child.id}
              section={child}
              documentId={documentId}
              allSections={allSections}
              onSectionClick={onSectionClick}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentOutline: React.FC<DocumentOutlineProps> = ({
  documentId,
  onSectionClick,
  onClose
}) => {
  const { t } = useThemeLanguage();
  const [outline, setOutline] = useState<DocumentOutlineType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionLevel, setNewSectionLevel] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load outline
  useEffect(() => {
    const loadedOutline = getOutline(documentId);
    setOutline(loadedOutline);
  }, [documentId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      addSection(documentId, newSectionTitle.trim(), newSectionLevel);
      setNewSectionTitle('');
      setShowAddForm(false);
      handleRefresh();
    }
  };

  const progress = calculateProgress(documentId);

  // Get root sections (no parent)
  const rootSections = outline?.sections
    .filter(s => !s.parentId)
    .sort((a, b) => a.order - b.order) || [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Document Outline
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors lg:hidden"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>

        {/* Progress Stats */}
        {outline && outline.sections.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {progress.progressPercentage}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                {progress.completedSections} / {progress.totalSections} sections
              </span>
              {progress.targetWords > 0 && (
                <span>
                  {progress.totalWords.toLocaleString()} / {progress.targetWords.toLocaleString()} words
                </span>
              )}
            </div>
          </div>
        )}

        {/* Add Section Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mt-3 w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>

      {/* Add Section Form */}
      {showAddForm && (
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/30 space-y-3">
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSection();
              if (e.key === 'Escape') {
                setShowAddForm(false);
                setNewSectionTitle('');
              }
            }}
            placeholder="Section title..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <select
              value={newSectionLevel}
              onChange={(e) => setNewSectionLevel(Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>Chapter (Level 1)</option>
              <option value={2}>Section (Level 2)</option>
              <option value={3}>Subsection (Level 3)</option>
            </select>

            <button
              onClick={handleAddSection}
              disabled={!newSectionTitle.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>

            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSectionTitle('');
              }}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Outline Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        {!outline || rootSections.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-2">
              No outline yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Add sections to structure your document
            </p>
          </div>
        ) : (
          rootSections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              documentId={documentId}
              allSections={outline.sections}
              onSectionClick={onSectionClick}
              onUpdate={handleRefresh}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentOutline;
