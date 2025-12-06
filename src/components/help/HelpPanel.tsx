/**
 * Help Panel Component
 *
 * Displays contextual help articles and search
 */

import React, { useState, useMemo } from 'react';
import { X, Search, Book, HelpCircle, ChevronRight, Video, ArrowLeft } from 'lucide-react';
import { useHelp } from '../../contexts/HelpContext';
import { useThemeLanguage } from '../../contexts/ThemeLanguageContext';

export const HelpPanel: React.FC = () => {
  const { t } = useThemeLanguage();
  const {
    isHelpOpen,
    currentArticle,
    searchQuery,
    closeHelp,
    setSearchQuery,
    searchArticles,
    openHelp
  } = useHelp();

  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    return searchArticles(localSearchQuery);
  }, [localSearchQuery, searchArticles]);

  const categories = useMemo(() => {
    const cats = new Set(searchResults.map(a => a.category));
    return Array.from(cats);
  }, [searchResults]);

  if (!isHelpOpen) return null;

  const handleBackToList = () => {
    openHelp(); // Opens help without specific article
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={closeHelp}
      />

      {/* Help Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {currentArticle && (
              <button
                onClick={handleBackToList}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                aria-label={t('ui.help.backToArticles')}
              >
                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <HelpCircle size={24} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentArticle ? currentArticle.title : t('ui.help.helpCenter')}
            </h2>
          </div>
          <button
            onClick={closeHelp}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={t('ui.help.closeHelp')}
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {currentArticle ? (
            // Article View
            <div className="p-6">
              {/* Category Badge */}
              <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
                {currentArticle.category}
              </div>

              {/* Video Link */}
              {currentArticle.videoUrl && (
                <a
                  href={currentArticle.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg mb-6 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-colors"
                >
                  <Video size={20} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="font-medium text-indigo-900 dark:text-indigo-300">
                    {t('ui.help.watchVideo')}
                  </span>
                  <ChevronRight size={16} className="ml-auto text-indigo-600 dark:text-indigo-400" />
                </a>
              )}

              {/* Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {currentArticle.content.split('\n').map((paragraph, index) => {
                  if (paragraph.trim() === '') return null;

                  // Detect headers (lines starting with **)
                  if (paragraph.includes('**')) {
                    const parts = paragraph.split('**');
                    return (
                      <p key={index} className="mb-3">
                        {parts.map((part, i) => (
                          i % 2 === 1 ? (
                            <strong key={i} className="font-bold text-slate-900 dark:text-white">
                              {part}
                            </strong>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        ))}
                      </p>
                    );
                  }

                  // Regular paragraphs
                  return (
                    <p key={index} className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                {currentArticle.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            // Articles List View
            <div className="p-6">
              {/* Search */}
              <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('ui.help.searchPlaceholder')}
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Results Count */}
              {localSearchQuery && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {searchResults.length} {searchResults.length === 1 ? t('ui.help.resultFound') : t('ui.help.resultsFound')}
                </p>
              )}

              {/* Articles by Category */}
              {categories.map(category => {
                const articlesInCategory = searchResults.filter(a => a.category === category);
                if (articlesInCategory.length === 0) return null;

                return (
                  <div key={category} className="mb-6">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
                      <Book size={14} />
                      {category}
                    </h3>

                    <div className="space-y-2">
                      {articlesInCategory.map(article => (
                        <button
                          key={article.id}
                          onClick={() => openHelp(article.id)}
                          className="w-full flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left group"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {article.content.substring(0, 100)}...
                            </p>
                            {article.videoUrl && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                                <Video size={12} />
                                <span>{t('ui.help.videoAvailable')}</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight
                            size={18}
                            className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* No Results */}
              {searchResults.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {t('ui.help.noArticlesFound')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t('ui.help.tryDifferentSearch')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            {t('ui.help.needMoreHelp')}{' '}
            <a
              href="/contact"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {t('ui.help.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
