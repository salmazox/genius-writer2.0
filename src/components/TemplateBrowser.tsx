/**
 * Template Browser Component
 *
 * Visual interface for browsing and selecting content templates
 * with search, filtering, and preview functionality.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  Sparkles,
  Clock,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import {
  getAllTemplates,
  getTemplatesByCategory,
  getPopularTemplates,
  searchTemplates,
  getCategoriesWithCounts,
  getTemplateById,
  ContentTemplate,
  TemplateCategory
} from '../services/contentTemplates';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface TemplateBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ContentTemplate) => void;
  currentToolType?: string; // Filter by current tool
}

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentToolType
}) => {
  const { t } = useThemeLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all' | 'popular'>('popular');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // State for async loaded data
  const [allTemplates, setAllTemplates] = useState<ContentTemplate[]>([]);
  const [categories, setCategories] = useState<Array<{
    category: TemplateCategory;
    name: string;
    icon: string;
    count: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates and categories on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [templatesData, categoriesData] = await Promise.all([
          getAllTemplates(),
          getCategoriesWithCounts()
        ]);
        setAllTemplates(templatesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates: ContentTemplate[];

    // Filter by tool type first if provided
    if (currentToolType) {
      templates = allTemplates.filter(t => t.toolType === currentToolType);
    } else if (selectedCategory === 'all') {
      templates = allTemplates;
    } else if (selectedCategory === 'popular') {
      templates = allTemplates.filter(t => t.popular);
    } else {
      templates = allTemplates.filter(t => t.category === selectedCategory);
    }

    // Apply search
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.includes(lowerQuery))
      );
    }

    // Apply difficulty filter
    if (difficultyFilter.length > 0) {
      templates = templates.filter(t => difficultyFilter.includes(t.difficulty));
    }

    return templates;
  }, [allTemplates, selectedCategory, searchQuery, difficultyFilter, currentToolType]);

  const handleSelectTemplate = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setShowMobilePreview(true); // Show preview on mobile
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  const handleCloseMobilePreview = () => {
    setShowMobilePreview(false);
    setSelectedTemplate(null);
  };

  const toggleDifficultyFilter = (difficulty: string) => {
    setDifficultyFilter(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="">
      <div className="h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200">
          <div className="flex items-start md:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <Sparkles size={20} className="text-indigo-600 flex-shrink-0 md:w-6 md:h-6" />
              <div className="min-w-0">
                <h2 className="text-lg md:text-2xl font-bold text-slate-900 truncate">
                  {t('ui.templates.title')}
                </h2>
                <p className="text-xs md:text-sm text-slate-600 truncate">
                  {filteredTemplates.length} {t('ui.templates.count')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex-shrink-0"
            >
              <Filter size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">{t('ui.templates.filters')}</span>
              {showFilters ? <ChevronUp size={12} className="md:w-3.5 md:h-3.5" /> : <ChevronDown size={12} className="md:w-3.5 md:h-3.5" />}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ui.templates.search')}
              className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  {t('ui.templates.difficulty.label')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => toggleDifficultyFilter(difficulty)}
                      className={`px-2.5 md:px-3 py-1 md:py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        difficultyFilter.includes(difficulty)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t(`ui.templates.difficulty.${difficulty}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          {!currentToolType && !isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide">
              <CategoryTab
                label={t('ui.templates.categories.popular')}
                icon="⭐"
                count={allTemplates.filter(t => t.popular).length}
                active={selectedCategory === 'popular'}
                onClick={() => setSelectedCategory('popular')}
              />
              <CategoryTab
                label={t('ui.templates.categories.all')}
                icon="📁"
                count={allTemplates.length}
                active={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              />
              {categories.map(cat => (
                <CategoryTab
                  key={cat.category}
                  label={cat.name}
                  icon={cat.icon}
                  count={cat.count}
                  active={selectedCategory === cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Template Grid */}
          <div className={`flex-1 p-4 md:p-6 overflow-y-auto ${selectedTemplate && !showMobilePreview ? 'hidden lg:block' : ''}`}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-slate-600">{t('ui.templates.loading')}</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 mb-2">{t('ui.templates.noResults')}</p>
                <p className="text-sm text-slate-400">
                  {t('ui.templates.tryAdjusting')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`p-3 md:p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{template.thumbnail}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">
                            {template.name}
                          </h3>
                          {template.popular && (
                            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-semibold">
                              <TrendingUp size={10} />
                              {t('ui.templates.popularBadge')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <Check size={20} className="text-indigo-600 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {template.estimatedTime} {t('ui.templates.time')}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        template.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {template.difficulty}
                      </span>
                      {template.industry !== 'general' && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          {template.industry}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Template Preview Sidebar - Desktop */}
          {selectedTemplate && (
            <div className="hidden lg:block w-96 border-l border-slate-200 p-6 overflow-y-auto bg-slate-50">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{selectedTemplate.thumbnail}</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedTemplate.category}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedTemplate.description}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    {t('ui.templates.useCases')}
                  </label>
                  <ul className="space-y-1">
                    {selectedTemplate.useCases.map((useCase, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    {t('ui.templates.details')}
                  </label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('ui.templates.detailLabels.difficulty')}</span>
                      <span className="font-semibold text-slate-900 capitalize">
                        {selectedTemplate.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('ui.templates.detailLabels.time')}</span>
                      <span className="font-semibold text-slate-900">
                        ~{selectedTemplate.estimatedTime} {t('ui.templates.minutes')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t('ui.templates.detailLabels.industry')}</span>
                      <span className="font-semibold text-slate-900 capitalize">
                        {selectedTemplate.industry}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    {t('ui.templates.tags')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUseTemplate}
                className="w-full"
              >
                {t('ui.templates.useTemplate')}
              </Button>
            </div>
          )}

          {/* Mobile Template Preview - Full Screen Overlay */}
          {selectedTemplate && showMobilePreview && (
            <div className="lg:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <button
                  onClick={handleCloseMobilePreview}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  ← {t('ui.templates.back')}
                </button>
                <span className="text-sm font-semibold text-slate-900">{t('ui.templates.templateDetails')}</span>
                <div className="w-16"></div>
              </div>

              <div className="p-4">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{selectedTemplate.thumbnail}</span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {selectedTemplate.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {selectedTemplate.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Use Cases
                    </label>
                    <ul className="space-y-1">
                      {selectedTemplate.useCases.map((useCase, idx) => (
                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Details
                    </label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('ui.templates.detailLabels.difficulty')}</span>
                        <span className="font-semibold text-slate-900 capitalize">
                          {selectedTemplate.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('ui.templates.detailLabels.time')}</span>
                        <span className="font-semibold text-slate-900">
                          ~{selectedTemplate.estimatedTime} {t('ui.templates.minutes')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('ui.templates.detailLabels.industry')}</span>
                        <span className="font-semibold text-slate-900 capitalize">
                          {selectedTemplate.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white pt-4 pb-safe">
                  <Button
                    onClick={handleUseTemplate}
                    className="w-full"
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Helper component for category tabs
const CategoryTab: React.FC<{
  label: string;
  icon: string;
  count: number;
  active: boolean;
  onClick: () => void;
}> = ({ label, icon, count, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded ${
          active ? 'bg-indigo-700' : 'bg-slate-100'
        }`}
      >
        {count}
      </span>
    </button>
  );
};

export default TemplateBrowser;
