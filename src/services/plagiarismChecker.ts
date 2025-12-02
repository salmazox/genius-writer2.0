/**
 * Plagiarism Checker Service
 *
 * Provides AI-powered originality checking for generated content.
 * Uses Gemini to analyze text for potential plagiarism, common phrases,
 * and unoriginal content patterns.
 *
 * This is a cost-effective alternative to services like Copyscape.
 */

import { ToolType } from '../types';
import { generateContent } from './gemini';

export interface PlagiarismResult {
  score: number; // 0-100 (100 = fully original)
  status: 'Original' | 'Possibly Copied' | 'Highly Unoriginal';
  flaggedPhrases: FlaggedPhrase[];
  analysis: {
    uniqueContentPercentage: number;
    commonPhrasesCount: number;
    overusedExpressionsCount: number;
    clicheCount: number;
  };
  suggestions: string[];
  checkedAt: number;
}

export interface FlaggedPhrase {
  phrase: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  startIndex: number;
  endIndex: number;
}

/**
 * Cache for plagiarism check results to avoid redundant API calls
 */
const plagiarismCache = new Map<string, PlagiarismResult>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a hash for content to use as cache key
 */
function generateContentHash(text: string): string {
  // Simple hash function for caching
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Check if text contains plagiarized or unoriginal content
 *
 * @param text - The text content to check for originality
 * @param options - Optional configuration for the check
 * @returns PlagiarismResult with score and flagged phrases
 */
export async function checkPlagiarism(
  text: string,
  options?: {
    toolType?: ToolType;
    checkCache?: boolean;
  }
): Promise<PlagiarismResult> {
  const { toolType = ToolType.SMART_EDITOR, checkCache = true } = options || {};

  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error('Text content is required for plagiarism checking');
  }

  // Check cache first
  if (checkCache) {
    const hash = generateContentHash(text);
    const cached = plagiarismCache.get(hash);

    if (cached && Date.now() - cached.checkedAt < CACHE_EXPIRY) {
      return cached;
    }
  }

  // Prepare the prompt for Gemini
  const prompt = `
You are an expert content originality analyzer. Analyze this text for potential plagiarism and originality issues:

TEXT TO ANALYZE:
"""
${text}
"""

Perform a comprehensive originality analysis:

1. **Originality Score** (0-100):
   - 90-100: Highly original, unique voice and ideas
   - 70-89: Mostly original with some common phrases
   - 50-69: Contains several generic or overused expressions
   - 30-49: Many common phrases, lacks originality
   - 0-29: Highly generic or potentially copied content

2. **Flagged Issues**: Identify specific phrases that are:
   - Common clichés or overused expressions
   - Generic statements found in many sources
   - Phrases that appear verbatim in typical content
   - Industry jargon used without originality

3. **Analysis Metrics**:
   - Percentage of unique vs. generic content
   - Count of common phrases
   - Count of overused expressions
   - Count of clichés

4. **Improvement Suggestions**: How to make the content more original

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "score": 85,
  "status": "Original",
  "flaggedPhrases": [
    {
      "phrase": "at the end of the day",
      "reason": "Common cliché used frequently in business writing",
      "severity": "medium",
      "startIndex": 150,
      "endIndex": 169
    }
  ],
  "analysis": {
    "uniqueContentPercentage": 85,
    "commonPhrasesCount": 2,
    "overusedExpressionsCount": 1,
    "clicheCount": 1
  },
  "suggestions": [
    "Replace clichéd phrases with specific, concrete language",
    "Add unique examples or case studies to differentiate content"
  ]
}

Status must be one of: "Original", "Possibly Copied", or "Highly Unoriginal"
Severity must be one of: "low", "medium", or "high"

Return JSON only, no markdown formatting, no additional text.
`;

  try {
    // Call Gemini API
    const response = await generateContent(toolType, { content: prompt });

    // Parse the JSON response
    const cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const result = JSON.parse(cleaned) as Omit<PlagiarismResult, 'checkedAt'>;

    // Add timestamp
    const finalResult: PlagiarismResult = {
      ...result,
      checkedAt: Date.now()
    };

    // Validate the result
    if (typeof finalResult.score !== 'number' ||
        finalResult.score < 0 ||
        finalResult.score > 100) {
      throw new Error('Invalid plagiarism score received');
    }

    // Cache the result
    const hash = generateContentHash(text);
    plagiarismCache.set(hash, finalResult);

    // Clean up old cache entries (keep only last 50)
    if (plagiarismCache.size > 50) {
      const firstKey = plagiarismCache.keys().next().value;
      if (firstKey) plagiarismCache.delete(firstKey);
    }

    return finalResult;

  } catch (error) {
    console.error('Plagiarism check failed:', error);

    // Return a fallback result on error
    return {
      score: 50,
      status: 'Possibly Copied',
      flaggedPhrases: [],
      analysis: {
        uniqueContentPercentage: 50,
        commonPhrasesCount: 0,
        overusedExpressionsCount: 0,
        clicheCount: 0
      },
      suggestions: ['Unable to complete plagiarism check. Please try again.'],
      checkedAt: Date.now()
    };
  }
}

/**
 * Get a color class based on plagiarism score
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-lime-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 30) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get a background color class based on plagiarism score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-50 border-green-200';
  if (score >= 70) return 'bg-lime-50 border-lime-200';
  if (score >= 50) return 'bg-yellow-50 border-yellow-200';
  if (score >= 30) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
}

/**
 * Get severity color for flagged phrases
 */
export function getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'high':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'medium':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 'low':
      return 'bg-blue-100 border-blue-300 text-blue-800';
  }
}

/**
 * Clear the plagiarism cache (useful for testing or memory management)
 */
export function clearPlagiarismCache(): void {
  plagiarismCache.clear();
}

/**
 * Get statistics about common plagiarism patterns
 * This can be used for educational purposes or reporting
 */
export function getPlagiarismStatistics(results: PlagiarismResult[]): {
  averageScore: number;
  totalChecks: number;
  mostCommonIssues: { reason: string; count: number }[];
} {
  if (results.length === 0) {
    return {
      averageScore: 0,
      totalChecks: 0,
      mostCommonIssues: []
    };
  }

  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  // Count issue types
  const issueMap = new Map<string, number>();
  results.forEach(result => {
    result.flaggedPhrases.forEach(phrase => {
      const count = issueMap.get(phrase.reason) || 0;
      issueMap.set(phrase.reason, count + 1);
    });
  });

  const mostCommonIssues = Array.from(issueMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    averageScore: Math.round(averageScore),
    totalChecks: results.length,
    mostCommonIssues
  };
}
