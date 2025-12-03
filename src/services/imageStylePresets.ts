/**
 * Image Style Presets Library
 *
 * Provides pre-defined artistic styles for AI image generation
 * with optimized prompts for consistent results.
 *
 * Presets are now lazy-loaded from JSON to reduce bundle size.
 */

import { loadPresets, preloadPresets } from './imageStylePresetsLoader';

export interface ImageStylePreset {
  id: string;
  name: string;
  description: string;
  category: 'realistic' | 'artistic' | 'digital' | 'vintage' | 'abstract' | 'specialized';
  prompt: string; // Prompt addition for this style
  negativePrompt?: string; // What to avoid
  thumbnail?: string; // Preview image URL or emoji
  popular: boolean;
  keywords: string[]; // For search
}

// Re-export preloadPresets for app initialization
export { preloadPresets };

/**
 * Get all style presets (async)
 */
export async function getAllPresets(): Promise<ImageStylePreset[]> {
  return loadPresets();
}

/**
 * Get presets by category (async)
 */
export async function getPresetsByCategory(category: ImageStylePreset['category']): Promise<ImageStylePreset[]> {
  const presets = await loadPresets();
  return presets.filter(preset => preset.category === category);
}

/**
 * Get popular presets (async)
 */
export async function getPopularPresets(): Promise<ImageStylePreset[]> {
  const presets = await loadPresets();
  return presets.filter(preset => preset.popular);
}

/**
 * Get preset by ID (async)
 */
export async function getPresetById(id: string): Promise<ImageStylePreset | undefined> {
  const presets = await loadPresets();
  return presets.find(preset => preset.id === id);
}

/**
 * Search presets by keyword (async)
 */
export async function searchPresets(query: string): Promise<ImageStylePreset[]> {
  const presets = await loadPresets();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return presets;

  return presets.filter(preset =>
    preset.name.toLowerCase().includes(lowerQuery) ||
    preset.description.toLowerCase().includes(lowerQuery) ||
    preset.keywords.some(keyword => keyword.includes(lowerQuery))
  );
}

/**
 * Apply style preset to base prompt (async)
 */
export async function applyStyleToPrompt(basePrompt: string, styleId: string): Promise<{
  enhancedPrompt: string;
  negativePrompt: string;
}> {
  const preset = await getPresetById(styleId);

  if (!preset) {
    return {
      enhancedPrompt: basePrompt,
      negativePrompt: ''
    };
  }

  // Combine base prompt with style prompt
  const enhancedPrompt = `${basePrompt}, ${preset.prompt}`;

  return {
    enhancedPrompt,
    negativePrompt: preset.negativePrompt || ''
  };
}

/**
 * Get category display name
 */
export function getCategoryName(category: ImageStylePreset['category']): string {
  const names: Record<ImageStylePreset['category'], string> = {
    realistic: 'Realistic',
    artistic: 'Artistic',
    digital: 'Digital',
    vintage: 'Vintage',
    abstract: 'Abstract',
    specialized: 'Specialized'
  };
  return names[category];
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: ImageStylePreset['category']): string {
  const icons: Record<ImageStylePreset['category'], string> = {
    realistic: '📷',
    artistic: '🎨',
    digital: '💻',
    vintage: '📜',
    abstract: '🎭',
    specialized: '⚡'
  };
  return icons[category];
}

/**
 * Get all categories with counts (async)
 */
export async function getCategoriesWithCounts(): Promise<Array<{
  category: ImageStylePreset['category'];
  name: string;
  icon: string;
  count: number;
}>> {
  const categories: ImageStylePreset['category'][] = [
    'realistic',
    'artistic',
    'digital',
    'vintage',
    'abstract',
    'specialized'
  ];

  const presets = await loadPresets();

  return categories.map(category => ({
    category,
    name: getCategoryName(category),
    icon: getCategoryIcon(category),
    count: presets.filter(p => p.category === category).length
  }));
}

/**
 * Export for other components
 */
export default {
  getAllPresets,
  getPresetsByCategory,
  getPopularPresets,
  getPresetById,
  searchPresets,
  applyStyleToPrompt,
  getCategoryName,
  getCategoryIcon,
  getCategoriesWithCounts
};
