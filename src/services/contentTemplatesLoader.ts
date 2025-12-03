/**
 * Content Templates Loader
 *
 * Lazy loads content templates from JSON with caching.
 * Reduces initial bundle size by loading templates on-demand.
 */

import { ContentTemplate, TemplateCategory, TemplateIndustry } from './contentTemplates';
import { ToolType } from '../types';

// Cache for loaded templates
let templatesCache: ContentTemplate[] | null = null;
let loadingPromise: Promise<ContentTemplate[]> | null = null;

/**
 * Map JSON toolType strings back to ToolType enum
 */
function mapToolType(toolType: string): ToolType {
  const mapping: Record<string, ToolType> = {
    'emailTemplate': ToolType.EMAIL_TEMPLATE,
    'emailPromo': ToolType.EMAIL_PROMO,
    'blogFull': ToolType.BLOG_FULL,
    'socialLinkedin': ToolType.SOCIAL_LINKEDIN,
    'socialTwitter': ToolType.SOCIAL_TWITTER,
    'smartEditor': ToolType.SMART_EDITOR,
  };
  return mapping[toolType] || ToolType.SMART_EDITOR;
}

/**
 * Load templates from JSON file with caching
 */
export async function loadTemplates(): Promise<ContentTemplate[]> {
  // Return cached templates if available
  if (templatesCache) {
    return templatesCache;
  }

  // Return existing loading promise if one is in progress
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = fetch('/data/contentTemplates.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load templates: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data: any[]) => {
      // Map JSON data back to ContentTemplate format with proper enums
      const templates: ContentTemplate[] = data.map(item => ({
        ...item,
        toolType: mapToolType(item.toolType),
        category: item.category as TemplateCategory,
        industry: item.industry as TemplateIndustry,
      }));

      // Cache the results
      templatesCache = templates;
      loadingPromise = null;
      return templates;
    })
    .catch(error => {
      console.error('Error loading content templates:', error);
      loadingPromise = null;
      // Return empty array on error
      return [];
    });

  return loadingPromise;
}

/**
 * Preload templates (call this during app initialization if desired)
 */
export function preloadTemplates(): void {
  if (!templatesCache && !loadingPromise) {
    loadTemplates().catch(err => {
      console.error('Failed to preload templates:', err);
    });
  }
}

/**
 * Clear the cache (useful for testing)
 */
export function clearTemplatesCache(): void {
  templatesCache = null;
  loadingPromise = null;
}

/**
 * Check if templates are loaded
 */
export function areTemplatesLoaded(): boolean {
  return templatesCache !== null;
}
