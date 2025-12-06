/**
 * Chapter Manager Component
 *
 * Manages chapters and sections for long-form documents.
 * Displays chapter metadata, progress tracking, and navigation.
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Target,
  FileText,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import {
  getChapters,
  addSection,
  updateSection,
  deleteSection,
  Chapter
} from '../services/documentOutliner';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface ChapterManagerProps {
  documentId: string;
  onChapterClick?: (chapterId: string) => void;
  onSectionClick?: (sectionId: string) => void;
  onClose?: () => void;
}

export const ChapterManager: React.FC<ChapterManagerProps> = ({
  documentId,
  onChapterClick,
  onSectionClick,
  onClose
}) => {
  const { t } = useThemeLanguage();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterGoal, setNewChapterGoal] = useState('');
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Load chapters
  useEffect(() => {
    const loadedChapters = getChapters(documentId);
    setChapters(loadedChapters);
  }, [documentId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleAddChapter = () => {
    if (newChapterTitle.trim()) {
      const wordCountGoal = newChapterGoal ? parseInt(newChapterGoal) : undefined;
      addSection(documentId, newChapterTitle.trim(), 1, undefined, {
        wordCountGoal
      });
      setNewChapterTitle('');
      setNewChapterGoal('');
      setShowAddChapter(false);
      handleRefresh();
    }
  };

  const handleStartEdit = (chapter: Chapter) => {
    setEditingChapter(chapter.id);
    setEditTitle(chapter.title);
    setEditGoal(chapter.wordCountGoal?.toString() || '');
  };

  const handleSaveEdit = (chapterId: string) => {
    if (editTitle.trim()) {
      const wordCountGoal = editGoal ? parseInt(editGoal) : undefined;
      updateSection(documentId, chapterId, {
        title: editTitle.trim(),
        wordCountGoal
      });
      setEditingChapter(null);
      handleRefresh();
    }
  };

  const handleDeleteChapter = (chapterId: string, chapterTitle: string) => {
    if (confirm(t('chapters.confirmDelete').replace('{title}', chapterTitle))) {
      deleteSection(documentId, chapterId);
      handleRefresh();
    }
  };

  const getStatusIcon = (status: Chapter['status']) => {
    switch (status) {
      case 'planning':
        return <Clock size={16} className="text-slate-500" />;
      case 'in-progress':
        return <Edit2 size={16} className="text-amber-500" />;
      case 'complete':
        return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  const getStatusText = (status: Chapter['status']) => {
    switch (status) {
      case 'planning':
        return t('chapters.statusPlanning');
      case 'in-progress':
        return t('chapters.statusInProgress');
      case 'complete':
        return t('chapters.statusComplete');
    }
  };

  const calculateProgress = (chapter: Chapter): number => {
    if (!chapter.wordCountGoal || chapter.wordCountGoal === 0) return 0;
    return Math.round((chapter.wordCount / chapter.wordCountGoal) * 100);
  };

  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const totalGoal = chapters.reduce((sum, ch) => sum + (ch.wordCountGoal || 0), 0);
  const overallProgress = totalGoal > 0 ? Math.round((totalWords / totalGoal) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              {t('chapters.title')}
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

        {/* Overall Progress */}
        {chapters.length > 0 && totalGoal > 0 && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">{t('chapters.overallProgress')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {overallProgress}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t('chapters.count').replace('{count}', chapters.length.toString())}</span>
              <span>
                {totalWords.toLocaleString()} / {totalGoal.toLocaleString()} {t('chapters.words')}
              </span>
            </div>
          </div>
        )}

        {/* Add Chapter Button */}
        <button
          onClick={() => setShowAddChapter(!showAddChapter)}
          className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} />
          {t('chapters.addChapter')}
        </button>
      </div>

      {/* Add Chapter Form */}
      {showAddChapter && (
        <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/30 space-y-3">
          <input
            type="text"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddChapter();
              if (e.key === 'Escape') {
                setShowAddChapter(false);
                setNewChapterTitle('');
                setNewChapterGoal('');
              }
            }}
            placeholder={t('chapters.chapterTitle')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newChapterGoal}
              onChange={(e) => setNewChapterGoal(e.target.value)}
              placeholder={t('chapters.wordCountGoal')}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={handleAddChapter}
              disabled={!newChapterTitle.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('chapters.add')}
            </button>

            <button
              onClick={() => {
                setShowAddChapter(false);
                setNewChapterTitle('');
                setNewChapterGoal('');
              }}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
            >
              {t('chapters.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto p-4">
        {chapters.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-2">
              {t('chapters.noChapters')}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('chapters.addChaptersHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter) => {
              const isExpanded = expandedChapters.has(chapter.id);
              const progress = calculateProgress(chapter);

              return (
                <div
                  key={chapter.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  {/* Chapter Header */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                    {editingChapter === chapter.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          value={editGoal}
                          onChange={(e) => setEditGoal(e.target.value)}
                          placeholder="Word count goal"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(chapter.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                          >
                            {t('chapters.save')}
                          </button>
                          <button
                            onClick={() => setEditingChapter(null)}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
                          >
                            {t('chapters.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                onClick={() => {
                                  onChapterClick?.(chapter.id);
                                  toggleChapter(chapter.id);
                                }}
                                className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                {chapter.title}
                              </h3>
                              <div className="flex items-center gap-1 text-xs">
                                {getStatusIcon(chapter.status)}
                                <span className="text-slate-500 dark:text-slate-400">
                                  {getStatusText(chapter.status)}
                                </span>
                              </div>
                            </div>

                            {chapter.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {chapter.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <FileText size={12} />
                                {t('chapters.sections').replace('{count}', chapter.sections.length.toString())}
                              </span>
                              {chapter.wordCountGoal && (
                                <span className="flex items-center gap-1">
                                  <Target size={12} />
                                  {chapter.wordCount.toLocaleString()} / {chapter.wordCountGoal.toLocaleString()} {t('chapters.words')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleStartEdit(chapter)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                              title={t('chapters.editChapter')}
                            >
                              <Edit2 size={14} className="text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chapter.id, chapter.title)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title={t('chapters.deleteChapter')}
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                            <button
                              onClick={() => toggleChapter(chapter.id)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                            >
                              <ChevronRight
                                size={16}
                                className={`text-slate-400 transition-transform ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {chapter.wordCountGoal && chapter.wordCountGoal > 0 && (
                          <div className="mt-2">
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  progress >= 100
                                    ? 'bg-green-500'
                                    : progress >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-indigo-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                              <span>{t('chapters.complete').replace('{progress}', progress.toString())}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Sections List */}
                  {isExpanded && chapter.sections.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      {chapter.sections.map((section) => (
                        <div
                          key={section.id}
                          onClick={() => onSectionClick?.(section.id)}
                          className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {section.title}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {section.wordCount} {t('chapters.words')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterManager;
