/**
 * SEO Scoring System
 *
 * Provides comprehensive SEO analysis for content including:
 * - Overall SEO score (0-100)
 * - Keyword density and distribution
 * - Readability metrics (Flesch reading ease)
 * - Content structure analysis
 * - Meta tag optimization
 * - Link recommendations
 * - Image alt text guidance
 */

export interface SEOKeywordAnalysis {
  keyword: string;
  count: number;
  density: number; // percentage
  distribution: 'good' | 'low' | 'high';
  inTitle: boolean;
  inFirstParagraph: boolean;
  inHeadings: number;
}

export interface ReadabilityMetrics {
  fleschScore: number; // 0-100 (higher = easier)
  fleschLevel: string; // e.g., "Easy", "Fairly Easy", "Standard"
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  sentenceCount: number;
  wordCount: number;
}

export interface ContentStructure {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  paragraphCount: number;
  listCount: number;
  averageParagraphLength: number;
  imageCount: number;
  imagesWithAlt: number;
  linkCount: number;
  internalLinks: number;
  externalLinks: number;
}

export interface SEORecommendation {
  category: 'critical' | 'warning' | 'suggestion' | 'success';
  title: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SEOScore {
  overall: number; // 0-100
  breakdown: {
    keywords: number;
    readability: number;
    structure: number;
    meta: number;
    technical: number;
  };
  keywordAnalysis: SEOKeywordAnalysis[];
  readability: ReadabilityMetrics;
  structure: ContentStructure;
  recommendations: SEORecommendation[];
}

/**
 * Calculate Flesch Reading Ease Score
 * Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
 */
function calculateFleschScore(
  wordCount: number,
  sentenceCount: number,
  syllableCount: number
): number {
  if (sentenceCount === 0 || wordCount === 0) return 0;

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  const score = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  return Math.max(0, Math.min(100, score));
}

/**
 * Get Flesch score reading level description
 */
function getFleschLevel(score: number): string {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Difficult';
}

/**
 * Count syllables in a word (approximate)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  // Count vowel groups
  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 0;

  // Adjust for silent e
  if (word.endsWith('e')) count--;

  // Ensure at least 1 syllable
  return Math.max(1, count);
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extract text content from HTML while preserving structure info
 */
function parseHtmlStructure(html: string): {
  text: string;
  headings: string[];
  paragraphs: string[];
  firstParagraph: string;
} {
  const headings: string[] = [];
  const paragraphs: string[] = [];

  // Extract headings
  const headingMatches = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
  headingMatches.forEach(match => {
    const text = stripHtml(match);
    if (text) headings.push(text);
  });

  // Extract paragraphs
  const paragraphMatches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
  paragraphMatches.forEach(match => {
    const text = stripHtml(match);
    if (text) paragraphs.push(text);
  });

  const firstParagraph = paragraphs[0] || '';
  const text = stripHtml(html);

  return { text, headings, paragraphs, firstParagraph };
}

/**
 * Analyze content structure
 */
function analyzeStructure(html: string): ContentStructure {
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

  const paragraphs = html.match(/<p[^>]*>.*?<\/p>/gi) || [];
  const paragraphCount = paragraphs.length;
  const paragraphLengths = paragraphs.map(p => stripHtml(p).split(/\s+/).length);
  const averageParagraphLength = paragraphLengths.length > 0
    ? paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length
    : 0;

  const listCount = (html.match(/<[uo]l[^>]*>/gi) || []).length;

  const images = html.match(/<img[^>]*>/gi) || [];
  const imageCount = images.length;
  const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img)).length;

  const links = html.match(/<a[^>]*href=["'][^"']+["'][^>]*>/gi) || [];
  const linkCount = links.length;
  const internalLinks = links.filter(link => !link.includes('http')).length;
  const externalLinks = linkCount - internalLinks;

  return {
    h1Count,
    h2Count,
    h3Count,
    paragraphCount,
    listCount,
    averageParagraphLength,
    imageCount,
    imagesWithAlt,
    linkCount,
    internalLinks,
    externalLinks
  };
}

/**
 * Analyze readability metrics
 */
function analyzeReadability(text: string): ReadabilityMetrics {
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  // Split into words
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Count syllables
  let syllableCount = 0;
  words.forEach(word => {
    syllableCount += countSyllables(word);
  });

  const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const averageSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;

  const fleschScore = calculateFleschScore(wordCount, sentenceCount, syllableCount);
  const fleschLevel = getFleschLevel(fleschScore);

  return {
    fleschScore,
    fleschLevel,
    averageWordsPerSentence,
    averageSyllablesPerWord,
    sentenceCount,
    wordCount
  };
}

/**
 * Analyze keyword usage and distribution
 */
function analyzeKeywords(
  html: string,
  keywords: string[],
  title?: string
): SEOKeywordAnalysis[] {
  if (keywords.length === 0) return [];

  const { text, headings, firstParagraph } = parseHtmlStructure(html);
  const textLower = text.toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const firstParaLower = firstParagraph.toLowerCase();
  const headingsLower = headings.map(h => h.toLowerCase());

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  return keywords.map(keyword => {
    const keywordLower = keyword.toLowerCase().trim();
    if (!keywordLower) return null;

    // Count occurrences
    const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = textLower.match(regex);
    const count = matches ? matches.length : 0;

    // Calculate density
    const density = wordCount > 0 ? (count / wordCount) * 100 : 0;

    // Determine distribution quality
    let distribution: 'good' | 'low' | 'high';
    if (density < 0.5) distribution = 'low';
    else if (density > 2.5) distribution = 'high';
    else distribution = 'good';

    // Check placements
    const inTitle = titleLower.includes(keywordLower);
    const inFirstParagraph = firstParaLower.includes(keywordLower);
    const inHeadings = headingsLower.filter(h => h.includes(keywordLower)).length;

    return {
      keyword,
      count,
      density,
      distribution,
      inTitle,
      inFirstParagraph,
      inHeadings
    };
  }).filter(Boolean) as SEOKeywordAnalysis[];
}

/**
 * Generate SEO recommendations based on analysis
 */
function generateRecommendations(
  keywordAnalysis: SEOKeywordAnalysis[],
  readability: ReadabilityMetrics,
  structure: ContentStructure,
  metaDescription?: string,
  title?: string
): SEORecommendation[] {
  const recommendations: SEORecommendation[] = [];

  // Title recommendations
  if (!title || title.length === 0) {
    recommendations.push({
      category: 'critical',
      title: 'Missing Title',
      message: 'Add a compelling title with your target keywords (50-60 characters recommended).',
      impact: 'high'
    });
  } else if (title.length > 60) {
    recommendations.push({
      category: 'warning',
      title: 'Title Too Long',
      message: `Your title is ${title.length} characters. Keep it under 60 for better search visibility.`,
      impact: 'medium'
    });
  } else if (title.length < 30) {
    recommendations.push({
      category: 'suggestion',
      title: 'Title Could Be Longer',
      message: `Your title is ${title.length} characters. Consider 50-60 for optimal SEO.`,
      impact: 'low'
    });
  }

  // Meta description
  if (!metaDescription || metaDescription.length === 0) {
    recommendations.push({
      category: 'warning',
      title: 'Missing Meta Description',
      message: 'Add a meta description (120-160 characters) to improve click-through rates.',
      impact: 'high'
    });
  } else if (metaDescription.length < 120) {
    recommendations.push({
      category: 'suggestion',
      title: 'Meta Description Too Short',
      message: `Your meta description is ${metaDescription.length} characters. Aim for 120-160.`,
      impact: 'medium'
    });
  } else if (metaDescription.length > 160) {
    recommendations.push({
      category: 'warning',
      title: 'Meta Description Too Long',
      message: `Your meta description is ${metaDescription.length} characters. Keep it under 160.`,
      impact: 'medium'
    });
  }

  // Keyword recommendations
  keywordAnalysis.forEach(kw => {
    if (kw.distribution === 'low') {
      recommendations.push({
        category: 'warning',
        title: `Low Keyword Density: "${kw.keyword}"`,
        message: `"${kw.keyword}" appears ${kw.count} times (${kw.density.toFixed(2)}%). Aim for 0.5-2.5%.`,
        impact: 'high'
      });
    } else if (kw.distribution === 'high') {
      recommendations.push({
        category: 'warning',
        title: `High Keyword Density: "${kw.keyword}"`,
        message: `"${kw.keyword}" appears ${kw.count} times (${kw.density.toFixed(2)}%). This may be keyword stuffing.`,
        impact: 'high'
      });
    }

    if (!kw.inTitle) {
      recommendations.push({
        category: 'suggestion',
        title: `Keyword Not in Title: "${kw.keyword}"`,
        message: `Consider adding "${kw.keyword}" to your title for better SEO.`,
        impact: 'medium'
      });
    }

    if (!kw.inFirstParagraph) {
      recommendations.push({
        category: 'suggestion',
        title: `Keyword Not in Opening: "${kw.keyword}"`,
        message: `Include "${kw.keyword}" in your first paragraph for better relevance signals.`,
        impact: 'medium'
      });
    }

    if (kw.inHeadings === 0) {
      recommendations.push({
        category: 'suggestion',
        title: `Keyword Not in Headings: "${kw.keyword}"`,
        message: `Use "${kw.keyword}" in at least one heading (H2 or H3).`,
        impact: 'low'
      });
    }
  });

  // Structure recommendations
  if (structure.h1Count === 0) {
    recommendations.push({
      category: 'critical',
      title: 'Missing H1 Heading',
      message: 'Add exactly one H1 heading as your main title.',
      impact: 'high'
    });
  } else if (structure.h1Count > 1) {
    recommendations.push({
      category: 'warning',
      title: 'Multiple H1 Headings',
      message: `You have ${structure.h1Count} H1 tags. Use only one H1 per page.`,
      impact: 'high'
    });
  }

  if (structure.h2Count === 0 && readability.wordCount > 300) {
    recommendations.push({
      category: 'warning',
      title: 'No H2 Subheadings',
      message: 'Break your content into sections with H2 headings for better readability.',
      impact: 'medium'
    });
  }

  if (structure.paragraphCount > 0 && structure.averageParagraphLength > 150) {
    recommendations.push({
      category: 'suggestion',
      title: 'Long Paragraphs',
      message: `Average paragraph length is ${Math.round(structure.averageParagraphLength)} words. Aim for 50-100 words.`,
      impact: 'low'
    });
  }

  if (structure.imageCount > 0 && structure.imagesWithAlt < structure.imageCount) {
    const missing = structure.imageCount - structure.imagesWithAlt;
    recommendations.push({
      category: 'warning',
      title: 'Missing Image Alt Text',
      message: `${missing} of ${structure.imageCount} images lack alt text. Add descriptive alt text for accessibility and SEO.`,
      impact: 'high'
    });
  }

  if (readability.wordCount > 500 && structure.listCount === 0) {
    recommendations.push({
      category: 'suggestion',
      title: 'Consider Adding Lists',
      message: 'Use bullet points or numbered lists to improve scannability.',
      impact: 'low'
    });
  }

  // Readability recommendations
  if (readability.fleschScore < 50) {
    recommendations.push({
      category: 'warning',
      title: 'Difficult Readability',
      message: `Flesch score: ${Math.round(readability.fleschScore)} (${readability.fleschLevel}). Simplify sentences for broader audience.`,
      impact: 'medium'
    });
  } else if (readability.fleschScore >= 60 && readability.fleschScore <= 70) {
    recommendations.push({
      category: 'success',
      title: 'Good Readability',
      message: `Flesch score: ${Math.round(readability.fleschScore)} (${readability.fleschLevel}). Your content is easy to read.`,
      impact: 'low'
    });
  }

  if (readability.averageWordsPerSentence > 25) {
    recommendations.push({
      category: 'warning',
      title: 'Long Sentences',
      message: `Average ${Math.round(readability.averageWordsPerSentence)} words per sentence. Aim for 15-20 for better readability.`,
      impact: 'medium'
    });
  }

  // Content length recommendations
  if (readability.wordCount < 300) {
    recommendations.push({
      category: 'warning',
      title: 'Short Content',
      message: `Your content is ${readability.wordCount} words. Aim for 300+ for better SEO (ideally 1000+).`,
      impact: 'high'
    });
  } else if (readability.wordCount >= 1000) {
    recommendations.push({
      category: 'success',
      title: 'Comprehensive Content',
      message: `${readability.wordCount} words is excellent for SEO. Search engines favor in-depth content.`,
      impact: 'low'
    });
  }

  return recommendations;
}

/**
 * Calculate individual component scores
 */
function calculateComponentScores(
  keywordAnalysis: SEOKeywordAnalysis[],
  readability: ReadabilityMetrics,
  structure: ContentStructure,
  metaDescription?: string,
  title?: string
): SEOScore['breakdown'] {
  // Keywords score (0-100)
  let keywordsScore = 50;
  if (keywordAnalysis.length > 0) {
    const goodDistribution = keywordAnalysis.filter(kw => kw.distribution === 'good').length;
    const inTitle = keywordAnalysis.filter(kw => kw.inTitle).length;
    const inFirstPara = keywordAnalysis.filter(kw => kw.inFirstParagraph).length;
    const inHeadings = keywordAnalysis.filter(kw => kw.inHeadings > 0).length;

    keywordsScore = (
      (goodDistribution / keywordAnalysis.length) * 40 +
      (inTitle / keywordAnalysis.length) * 30 +
      (inFirstPara / keywordAnalysis.length) * 20 +
      (inHeadings / keywordAnalysis.length) * 10
    );
  } else {
    keywordsScore = 0; // No keywords provided
  }

  // Readability score (0-100)
  let readabilityScore = 0;
  if (readability.wordCount > 0) {
    const fleschNormalized = readability.fleschScore;
    const sentenceLengthScore = Math.max(0, 100 - (readability.averageWordsPerSentence - 15) * 3);
    readabilityScore = (fleschNormalized * 0.7 + sentenceLengthScore * 0.3);
  }

  // Structure score (0-100)
  let structureScore = 0;
  structureScore += structure.h1Count === 1 ? 25 : 0;
  structureScore += structure.h2Count > 0 ? 20 : 0;
  structureScore += structure.listCount > 0 ? 15 : 0;
  structureScore += structure.paragraphCount > 3 ? 15 : structure.paragraphCount * 5;
  structureScore += structure.imageCount > 0 && structure.imagesWithAlt === structure.imageCount ? 25 :
                    structure.imageCount > 0 ? 10 : 0;

  // Meta score (0-100)
  let metaScore = 0;
  if (title && title.length >= 30 && title.length <= 60) metaScore += 50;
  else if (title && title.length > 0) metaScore += 25;

  if (metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160) metaScore += 50;
  else if (metaDescription && metaDescription.length > 0) metaScore += 25;

  // Technical score (0-100)
  let technicalScore = 70; // Base score
  if (readability.wordCount >= 300) technicalScore += 15;
  if (readability.wordCount >= 1000) technicalScore += 15;

  return {
    keywords: Math.round(keywordsScore),
    readability: Math.round(readabilityScore),
    structure: Math.round(structureScore),
    meta: Math.round(metaScore),
    technical: Math.round(technicalScore)
  };
}

/**
 * Calculate overall SEO score
 */
export function calculateSEOScore(
  content: string,
  keywords: string[] = [],
  options?: {
    title?: string;
    metaDescription?: string;
  }
): SEOScore {
  const { title, metaDescription } = options || {};

  // Analyze all aspects
  const keywordAnalysis = analyzeKeywords(content, keywords, title);
  const readability = analyzeReadability(stripHtml(content));
  const structure = analyzeStructure(content);
  const recommendations = generateRecommendations(
    keywordAnalysis,
    readability,
    structure,
    metaDescription,
    title
  );

  // Calculate component scores
  const breakdown = calculateComponentScores(
    keywordAnalysis,
    readability,
    structure,
    metaDescription,
    title
  );

  // Calculate overall weighted score
  const overall = Math.round(
    breakdown.keywords * 0.25 +
    breakdown.readability * 0.2 +
    breakdown.structure * 0.2 +
    breakdown.meta * 0.2 +
    breakdown.technical * 0.15
  );

  return {
    overall,
    breakdown,
    keywordAnalysis,
    readability,
    structure,
    recommendations
  };
}

/**
 * Get score color class for UI display
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

/**
 * Get score label for display
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

/**
 * Get recommendation icon based on category
 */
export function getRecommendationIcon(category: SEORecommendation['category']): string {
  switch (category) {
    case 'critical': return '🔴';
    case 'warning': return '⚠️';
    case 'suggestion': return '💡';
    case 'success': return '✅';
    default: return '📝';
  }
}

/**
 * Export for other components
 */
export default {
  calculateSEOScore,
  getScoreColor,
  getScoreLabel,
  getRecommendationIcon
};
