/**
 * Image Style Selector Component
 *
 * Visual interface for browsing and selecting image style presets
 * with category filtering, search, and preview functionality.
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Check,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  getAllPresets,
  getPresetsByCategory,
  getPopularPresets,
  searchPresets,
  getCategoriesWithCounts,
  ImageStylePreset
} from '../services/imageStylePresets';

interface ImageStyleSelectorProps {
  selectedStyleId?: string | null;
  onSelectStyle: (preset: ImageStylePreset | null) => void;
  basePrompt?: string; // To show enhanced preview
}

export const ImageStyleSelector: React.FC<ImageStyleSelectorProps> = ({
  selectedStyleId,
  onSelectStyle,
  basePrompt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ImageStylePreset['category'] | 'all' | 'popular'>('popular');
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const categories = getCategoriesWithCounts();
  const selectedPreset = selectedStyleId
    ? getAllPresets().find(p => p.id === selectedStyleId)
    : null;

  // Filter presets based on category and search
  const filteredPresets = useMemo(() => {
    let presets: ImageStylePreset[];

    if (selectedCategory === 'all') {
      presets = getAllPresets();
    } else if (selectedCategory === 'popular') {
      presets = getPopularPresets();
    } else {
      presets = getPresetsByCategory(selectedCategory);
    }

    if (searchQuery.trim()) {
      presets = searchPresets(searchQuery).filter(p =>
        selectedCategory === 'all' || selectedCategory === 'popular' || p.category === selectedCategory
      );
    }

    return presets;
  }, [selectedCategory, searchQuery]);

  const handleSelectPreset = (preset: ImageStylePreset) => {
    if (selectedPreset?.id === preset.id) {
      onSelectStyle(null); // Deselect
    } else {
      onSelectStyle(preset);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600" />
          <h4 className="font-bold text-slate-900">Style Presets</h4>
        </div>
        {selectedPreset && (
          <button
            onClick={() => onSelectStyle(null)}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <X size={14} />
            Clear Style
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search styles..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <CategoryTab
          label="Popular"
          icon="⭐"
          count={getPopularPresets().length}
          active={selectedCategory === 'popular'}
          onClick={() => setSelectedCategory('popular')}
        />
        <CategoryTab
          label="All"
          icon="📁"
          count={getAllPresets().length}
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

      {/* Selected Style Info */}
      {selectedPreset && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedPreset.thumbnail}</span>
              <div>
                <div className="font-bold text-sm text-indigo-900">
                  {selectedPreset.name}
                </div>
                <div className="text-xs text-indigo-600">
                  {selectedPreset.description}
                </div>
              </div>
            </div>
            <Check size={16} className="text-indigo-600" />
          </div>

          {/* Prompt Preview Toggle */}
          {basePrompt && (
            <button
              onClick={() => setShowPromptPreview(!showPromptPreview)}
              className="flex items-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 mt-2"
            >
              <Info size={12} />
              <span>
                {showPromptPreview ? 'Hide' : 'Show'} Enhanced Prompt
              </span>
              {showPromptPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          {showPromptPreview && basePrompt && (
            <div className="mt-2 p-2 bg-white rounded text-xs text-slate-700 font-mono">
              <div className="mb-1 text-[10px] font-bold text-slate-500 uppercase">
                Enhanced Prompt:
              </div>
              {basePrompt}, {selectedPreset.prompt}
            </div>
          )}
        </div>
      )}

      {/* Style Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
        {filteredPresets.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
              selectedPreset?.id === preset.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-2xl">{preset.thumbnail}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 mb-0.5">
                  {preset.name}
                </div>
                {preset.popular && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-semibold uppercase">
                    Popular
                  </span>
                )}
              </div>
              {selectedPreset?.id === preset.id && (
                <Check size={16} className="text-indigo-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">
              {preset.description}
            </p>
          </button>
        ))}
      </div>

      {/* No Results */}
      {filteredPresets.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          <Search size={32} className="mx-auto mb-2 text-slate-300" />
          No styles found for "{searchQuery}"
        </div>
      )}

      {/* Help Text */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-600">
            <p className="font-semibold mb-1">How Style Presets Work</p>
            <p>
              Style presets enhance your base prompt with carefully crafted
              keywords to achieve consistent artistic styles. The AI will
              generate images matching your selected aesthetic.
            </p>
          </div>
        </div>
      </div>
    </div>
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
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded ${
          active ? 'bg-indigo-700' : 'bg-slate-200'
        }`}
      >
        {count}
      </span>
    </button>
  );
};

export default ImageStyleSelector;
