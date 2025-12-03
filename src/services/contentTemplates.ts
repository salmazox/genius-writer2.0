/**
 * Content Templates Library
 *
 * Pre-built templates for common use cases across industries
 * to accelerate content creation and provide best-practice structures.
 *
 * Templates are now lazy-loaded from JSON to reduce bundle size.
 */

import { ToolType } from '../types';
import { loadTemplates, preloadTemplates } from './contentTemplatesLoader';

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry?: TemplateIndustry;
  toolType: ToolType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  popular: boolean;
  tags: string[];
  prefilledInputs: Record<string, any>; // Pre-filled form values
  thumbnail?: string; // Emoji or image
  useCases: string[];
}

export type TemplateCategory =
  | 'marketing'
  | 'sales'
  | 'social-media'
  | 'email'
  | 'blog'
  | 'product'
  | 'seo'
  | 'ads'
  | 'business'
  | 'creative';

export type TemplateIndustry =
  | 'general'
  | 'saas'
  | 'ecommerce'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'real-estate'
  | 'legal'
  | 'hospitality'
  | 'technology';

// Re-export preloadTemplates for app initialization
export { preloadTemplates };

/**
 * Get all templates (async)
 */
export async function getAllTemplates(): Promise<ContentTemplate[]> {
  return loadTemplates();
}

/**
 * Get templates by category (async)
 */
export async function getTemplatesByCategory(category: TemplateCategory): Promise<ContentTemplate[]> {
  const templates = await loadTemplates();
  return templates.filter(t => t.category === category);
}

/**
 * Get templates by industry (async)
 */
export async function getTemplatesByIndustry(industry: TemplateIndustry): Promise<ContentTemplate[]> {
  const templates = await loadTemplates();
  return templates.filter(t => t.industry === industry);
}

/**
 * Get templates by tool type (async)
 */
export async function getTemplatesByToolType(toolType: ToolType): Promise<ContentTemplate[]> {
  const templates = await loadTemplates();
  return templates.filter(t => t.toolType === toolType);
}

/**
 * Get popular templates (async)
 */
export async function getPopularTemplates(): Promise<ContentTemplate[]> {
  const templates = await loadTemplates();
  return templates.filter(t => t.popular);
}

/**
 * Get template by ID (async)
 */
export async function getTemplateById(id: string): Promise<ContentTemplate | undefined> {
  const templates = await loadTemplates();
  return templates.find(t => t.id === id);
}

/**
 * Search templates (async)
 */
export async function searchTemplates(query: string): Promise<ContentTemplate[]> {
  const templates = await loadTemplates();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return templates;

  return templates.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.includes(lowerQuery)) ||
    t.useCases.some(uc => uc.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: TemplateCategory): {
  name: string;
  icon: string;
  description: string;
} {
  const info: Record<TemplateCategory, { name: string; icon: string; description: string }> = {
    marketing: { name: 'Marketing', icon: '📣', description: 'Marketing campaigns and content' },
    sales: { name: 'Sales', icon: '💼', description: 'Sales emails and proposals' },
    'social-media': { name: 'Social Media', icon: '📱', description: 'Social posts and content' },
    email: { name: 'Email', icon: '📧', description: 'Email campaigns and templates' },
    blog: { name: 'Blog', icon: '📝', description: 'Blog posts and articles' },
    product: { name: 'Product', icon: '🚀', description: 'Product content and docs' },
    seo: { name: 'SEO', icon: '🔍', description: 'SEO-optimized content' },
    ads: { name: 'Advertising', icon: '📣', description: 'Ad copy and campaigns' },
    business: { name: 'Business', icon: '💼', description: 'Business communications' },
    creative: { name: 'Creative', icon: '🎨', description: 'Creative content and scripts' }
  };
  return info[category];
}

/**
 * Get all categories with counts (async)
 */
export async function getCategoriesWithCounts(): Promise<Array<{
  category: TemplateCategory;
  name: string;
  icon: string;
  count: number;
}>> {
  const categories: TemplateCategory[] = [
    'marketing', 'sales', 'social-media', 'email', 'blog',
    'product', 'seo', 'ads', 'business', 'creative'
  ];

  const templates = await loadTemplates();

  return categories.map(category => {
    const info = getCategoryInfo(category);
    return {
      category,
      name: info.name,
      icon: info.icon,
      count: templates.filter(t => t.category === category).length
    };
  });
}

export default {
  getAllTemplates,
  getTemplatesByCategory,
  getTemplatesByIndustry,
  getTemplatesByToolType,
  getPopularTemplates,
  getTemplateById,
  searchTemplates,
  getCategoryInfo,
  getCategoriesWithCounts
};
