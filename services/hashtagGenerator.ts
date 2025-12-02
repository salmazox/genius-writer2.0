/**
 * Hashtag Generator Service
 *
 * Generates relevant, trending hashtags for social media content
 * across Twitter, LinkedIn, and Instagram platforms.
 */

import { ToolType } from '../types';
import { generateContent } from './gemini';

export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram';

export interface HashtagSuggestion {
  hashtag: string;
  relevance: 'high' | 'medium' | 'low';
  popularity: 'trending' | 'popular' | 'niche';
  category: string; // e.g., 'industry', 'topic', 'trending', 'branded'
}

export interface HashtagResult {
  hashtags: HashtagSuggestion[];
  platform: SocialPlatform;
  generatedAt: number;
}

/**
 * Platform-specific hashtag guidelines
 */
const PLATFORM_RULES = {
  twitter: {
    maxRecommended: 2,
    maxAllowed: 5,
    style: 'Short and concise',
    guidance: 'Twitter users prefer 1-2 hashtags. Focus on trending topics and brevity.'
  },
  linkedin: {
    maxRecommended: 5,
    maxAllowed: 10,
    style: 'Professional and industry-specific',
    guidance: 'LinkedIn favors professional, industry-related hashtags. 3-5 is optimal.'
  },
  instagram: {
    maxRecommended: 15,
    maxAllowed: 30,
    style: 'Mix of popular and niche',
    guidance: 'Instagram allows up to 30 hashtags. Mix popular, niche, and branded tags for best reach.'
  }
};

/**
 * Cache for hashtag results to avoid redundant API calls
 */
const hashtagCache = new Map<string, HashtagResult>();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a cache key for hashtag requests
 */
function generateCacheKey(content: string, platform: SocialPlatform, count: number): string {
  const contentHash = content.slice(0, 100).toLowerCase().replace(/\s+/g, '-');
  return `${platform}-${count}-${contentHash}`;
}

/**
 * Generate hashtag suggestions for social media content
 *
 * @param content - The social media post content
 * @param platform - The target platform (twitter, linkedin, instagram)
 * @param count - Number of hashtags to generate (defaults to platform recommended)
 * @param options - Additional options
 * @returns HashtagResult with suggested hashtags
 */
export async function generateHashtags(
  content: string,
  platform: SocialPlatform = 'twitter',
  count?: number,
  options?: {
    includeKeywords?: string[]; // Additional keywords to consider
    excludeHashtags?: string[]; // Hashtags to avoid
    tone?: string; // Content tone (professional, casual, etc.)
    useCache?: boolean;
  }
): Promise<HashtagResult> {
  const {
    includeKeywords = [],
    excludeHashtags = [],
    tone = 'neutral',
    useCache = true
  } = options || {};

  // Validate input
  if (!content || content.trim().length === 0) {
    throw new Error('Content is required to generate hashtags');
  }

  // Default count based on platform
  const targetCount = count || PLATFORM_RULES[platform].maxRecommended;

  // Check cache
  if (useCache) {
    const cacheKey = generateCacheKey(content, platform, targetCount);
    const cached = hashtagCache.get(cacheKey);

    if (cached && Date.now() - cached.generatedAt < CACHE_EXPIRY) {
      return cached;
    }
  }

  // Get platform rules
  const rules = PLATFORM_RULES[platform];

  // Build the prompt for Gemini
  const prompt = `
You are an expert social media strategist specializing in hashtag optimization.

Generate ${targetCount} relevant hashtags for this ${platform.toUpperCase()} post:

POST CONTENT:
"""
${content}
"""

PLATFORM: ${platform}
PLATFORM GUIDELINES: ${rules.guidance}
HASHTAG STYLE: ${rules.style}
CONTENT TONE: ${tone}

${includeKeywords.length > 0 ? `KEYWORDS TO CONSIDER: ${includeKeywords.join(', ')}` : ''}
${excludeHashtags.length > 0 ? `AVOID THESE HASHTAGS: ${excludeHashtags.join(', ')}` : ''}

For each hashtag, consider:
1. **Relevance**: How well does it match the post content?
2. **Popularity**: Is it trending, popular, or niche?
3. **Category**: What type of hashtag is it?
   - industry: Industry-specific hashtags
   - topic: Topic/subject hashtags
   - trending: Currently trending hashtags
   - branded: Brand or campaign hashtags
   - community: Community or audience hashtags

IMPORTANT RULES:
- All hashtags must start with #
- No spaces in hashtags (use CamelCase if needed)
- Keep hashtags concise and readable
- For ${platform}: Use ${rules.maxRecommended} hashtags (max ${rules.maxAllowed})
- Balance between popular and niche hashtags
- Ensure hashtags are genuinely relevant to the content

Return ONLY valid JSON in this exact format:
{
  "hashtags": [
    {
      "hashtag": "#Marketing",
      "relevance": "high",
      "popularity": "popular",
      "category": "industry"
    },
    {
      "hashtag": "#ContentStrategy",
      "relevance": "high",
      "popularity": "popular",
      "category": "topic"
    }
  ]
}

Relevance must be: "high", "medium", or "low"
Popularity must be: "trending", "popular", or "niche"
Category must be: "industry", "topic", "trending", "branded", or "community"

Return JSON only, no markdown formatting, no additional text.
`;

  try {
    // Call Gemini API
    const toolType = platform === 'twitter' ? ToolType.SOCIAL_TWITTER : ToolType.SOCIAL_LINKEDIN;
    const response = await generateContent(toolType, { content: prompt });

    // Parse the JSON response
    const cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned) as { hashtags: HashtagSuggestion[] };

    // Validate and filter hashtags
    const validHashtags = parsed.hashtags
      .filter(h => h.hashtag.startsWith('#'))
      .filter(h => !excludeHashtags.includes(h.hashtag))
      .slice(0, rules.maxAllowed);

    const result: HashtagResult = {
      hashtags: validHashtags,
      platform,
      generatedAt: Date.now()
    };

    // Cache the result
    const cacheKey = generateCacheKey(content, platform, targetCount);
    hashtagCache.set(cacheKey, result);

    // Clean up old cache entries (keep only last 50)
    if (hashtagCache.size > 50) {
      const firstKey = hashtagCache.keys().next().value;
      if (firstKey) hashtagCache.delete(firstKey);
    }

    return result;

  } catch (error) {
    console.error('Hashtag generation failed:', error);

    // Return fallback hashtags on error
    return {
      hashtags: [
        {
          hashtag: `#${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
          relevance: 'medium',
          popularity: 'popular',
          category: 'topic'
        }
      ],
      platform,
      generatedAt: Date.now()
    };
  }
}

/**
 * Get color class for relevance level
 */
export function getRelevanceColor(relevance: 'high' | 'medium' | 'low'): string {
  switch (relevance) {
    case 'high':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

/**
 * Get icon/badge for popularity level
 */
export function getPopularityBadge(popularity: 'trending' | 'popular' | 'niche'): string {
  switch (popularity) {
    case 'trending':
      return '🔥';
    case 'popular':
      return '⭐';
    case 'niche':
      return '🎯';
  }
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'industry':
      return '🏢';
    case 'topic':
      return '📌';
    case 'trending':
      return '📈';
    case 'branded':
      return '🏷️';
    case 'community':
      return '👥';
    default:
      return '🔖';
  }
}

/**
 * Format hashtags for copy-paste
 */
export function formatHashtagsForPost(hashtags: HashtagSuggestion[]): string {
  return hashtags.map(h => h.hashtag).join(' ');
}

/**
 * Get platform-specific recommendations
 */
export function getPlatformGuidelines(platform: SocialPlatform): {
  recommended: number;
  max: number;
  tips: string[];
} {
  const rules = PLATFORM_RULES[platform];

  const tips: { [key in SocialPlatform]: string[] } = {
    twitter: [
      'Use 1-2 hashtags for best engagement',
      'Place hashtags at the end of your tweet',
      'Capitalize words in multi-word hashtags (#ContentMarketing)',
      'Check trending hashtags before posting'
    ],
    linkedin: [
      'Use 3-5 industry-specific hashtags',
      'Focus on professional, business-related tags',
      'Mix popular and niche hashtags',
      'Place hashtags at the end or in comments'
    ],
    instagram: [
      'Use 10-15 hashtags for optimal reach',
      'Mix popular (1M+ posts) and niche (10K-100K posts) tags',
      'Use branded hashtags for campaigns',
      'Research hashtags before using them',
      'Place in first comment to keep caption clean'
    ]
  };

  return {
    recommended: rules.maxRecommended,
    max: rules.maxAllowed,
    tips: tips[platform]
  };
}

/**
 * Clear the hashtag cache
 */
export function clearHashtagCache(): void {
  hashtagCache.clear();
}
