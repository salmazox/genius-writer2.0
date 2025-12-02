/**
 * Brand Voice Analyzer Service
 *
 * Analyzes content to check consistency with brand voice guidelines.
 * Provides scoring and recommendations for brand alignment.
 */

import { BrandVoice } from './brandKit';

export interface VoiceAnalysisResult {
  score: number; // 0-100
  issues: VoiceIssue[];
  suggestions: string[];
  metrics: {
    toneMatch: number;
    styleMatch: number;
    terminologyMatch: number;
    forbiddenPhrasesFound: number;
  };
}

export interface VoiceIssue {
  type: 'tone' | 'style' | 'terminology' | 'forbidden';
  severity: 'low' | 'medium' | 'high';
  message: string;
  position?: number;
}

/**
 * Analyze content against brand voice guidelines
 */
export function analyzeContent(content: string, brandVoice: BrandVoice): VoiceAnalysisResult {
  const plainText = stripHtml(content);

  const issues: VoiceIssue[] = [];
  const suggestions: string[] = [];

  // Analyze tone
  const toneScore = analyzeTone(plainText, brandVoice.tone);
  if (toneScore < 60) {
    issues.push({
      type: 'tone',
      severity: 'medium',
      message: `Content tone doesn't match expected ${brandVoice.tone} tone`
    });
    suggestions.push(`Consider adjusting language to be more ${brandVoice.tone}`);
  }

  // Check for forbidden phrases (don'ts)
  const forbiddenCount = checkForbiddenPhrases(plainText, brandVoice.donts);
  if (forbiddenCount > 0) {
    issues.push({
      type: 'forbidden',
      severity: 'high',
      message: `Found ${forbiddenCount} forbidden phrase(s) from brand guidelines`
    });
    suggestions.push('Remove or rephrase forbidden terms listed in brand don\'ts');
  }

  // Check for recommended phrases (dos)
  const styleScore = checkStyleGuidelines(plainText, brandVoice.dos);
  if (styleScore < 50 && brandVoice.dos.length > 0) {
    suggestions.push('Consider incorporating more recommended phrases from brand guidelines');
  }

  // Check industry terminology
  const terminologyScore = checkTerminology(plainText, brandVoice.industryTerms);
  if (terminologyScore < 40 && brandVoice.industryTerms.length > 0) {
    suggestions.push('Use more industry-specific terminology for credibility');
  }

  // Calculate overall score
  const score = Math.round(
    (toneScore * 0.4 + styleScore * 0.3 + terminologyScore * 0.2 + (forbiddenCount === 0 ? 100 : 0) * 0.1)
  );

  return {
    score,
    issues,
    suggestions,
    metrics: {
      toneMatch: toneScore,
      styleMatch: styleScore,
      terminologyMatch: terminologyScore,
      forbiddenPhrasesFound: forbiddenCount
    }
  };
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Analyze tone of content
 */
function analyzeTone(text: string, expectedTone: BrandVoice['tone']): number {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // Define tone keywords
  const toneKeywords: Record<BrandVoice['tone'], string[]> = {
    professional: ['ensure', 'deliver', 'provide', 'guarantee', 'solution', 'expertise', 'professional', 'quality', 'reliable'],
    casual: ['hey', 'cool', 'awesome', 'check out', 'fun', 'easy', 'simple', 'great', 'love'],
    friendly: ['welcome', 'happy', 'glad', 'enjoy', 'help', 'together', 'community', 'share', 'support'],
    formal: ['furthermore', 'therefore', 'consequently', 'accordingly', 'hereby', 'pursuant', 'whereas', 'aforementioned'],
    playful: ['fun', 'exciting', 'amazing', 'fantastic', 'awesome', 'yay', 'wow', 'boom', 'splash'],
    authoritative: ['proven', 'leading', 'expert', 'industry', 'standard', 'authoritative', 'definitive', 'comprehensive']
  };

  const relevantKeywords = toneKeywords[expectedTone] || [];
  let matchCount = 0;

  for (const keyword of relevantKeywords) {
    if (lowerText.includes(keyword)) {
      matchCount++;
    }
  }

  // Score based on keyword presence
  const score = Math.min(100, (matchCount / Math.max(relevantKeywords.length, 1)) * 150);
  return Math.round(score);
}

/**
 * Check for forbidden phrases
 */
function checkForbiddenPhrases(text: string, donts: string[]): number {
  const lowerText = text.toLowerCase();
  let count = 0;

  for (const phrase of donts) {
    if (lowerText.includes(phrase.toLowerCase())) {
      count++;
    }
  }

  return count;
}

/**
 * Check style guidelines
 */
function checkStyleGuidelines(text: string, dos: string[]): number {
  if (dos.length === 0) return 100;

  const lowerText = text.toLowerCase();
  let matchCount = 0;

  for (const phrase of dos) {
    if (lowerText.includes(phrase.toLowerCase())) {
      matchCount++;
    }
  }

  const score = (matchCount / dos.length) * 100;
  return Math.round(score);
}

/**
 * Check industry terminology usage
 */
function checkTerminology(text: string, terms: string[]): number {
  if (terms.length === 0) return 100;

  const lowerText = text.toLowerCase();
  let matchCount = 0;

  for (const term of terms) {
    if (lowerText.includes(term.toLowerCase())) {
      matchCount++;
    }
  }

  const score = (matchCount / terms.length) * 100;
  return Math.round(score);
}

/**
 * Get tone-specific writing tips
 */
export function getToneTips(tone: BrandVoice['tone']): string[] {
  const tips: Record<BrandVoice['tone'], string[]> = {
    professional: [
      'Use clear, concise language',
      'Avoid slang and colloquialisms',
      'Focus on facts and expertise',
      'Maintain formal sentence structure'
    ],
    casual: [
      'Use conversational language',
      'Include contractions naturally',
      'Keep sentences short and snappy',
      'Add personality to your writing'
    ],
    friendly: [
      'Address readers directly with "you"',
      'Use warm, welcoming language',
      'Show empathy and understanding',
      'Create a sense of community'
    ],
    formal: [
      'Use complete sentences',
      'Avoid contractions',
      'Employ sophisticated vocabulary',
      'Maintain professional distance'
    ],
    playful: [
      'Use creative language and wordplay',
      'Include exclamation points sparingly',
      'Add personality and humor',
      'Keep energy levels high'
    ],
    authoritative: [
      'Cite sources and data',
      'Use industry terminology',
      'Demonstrate expertise',
      'Be confident but not arrogant'
    ]
  };

  return tips[tone] || [];
}

/**
 * Generate brand voice report
 */
export function generateVoiceReport(results: VoiceAnalysisResult): string {
  let report = `# Brand Voice Analysis\n\n`;
  report += `**Overall Score:** ${results.score}/100\n\n`;

  report += `## Metrics\n`;
  report += `- Tone Match: ${results.metrics.toneMatch}%\n`;
  report += `- Style Match: ${results.metrics.styleMatch}%\n`;
  report += `- Terminology Match: ${results.metrics.terminologyMatch}%\n`;
  report += `- Forbidden Phrases: ${results.metrics.forbiddenPhrasesFound}\n\n`;

  if (results.issues.length > 0) {
    report += `## Issues Found\n`;
    results.issues.forEach((issue, index) => {
      report += `${index + 1}. **${issue.severity.toUpperCase()}:** ${issue.message}\n`;
    });
    report += `\n`;
  }

  if (results.suggestions.length > 0) {
    report += `## Suggestions\n`;
    results.suggestions.forEach((suggestion, index) => {
      report += `${index + 1}. ${suggestion}\n`;
    });
  }

  return report;
}

export default {
  analyzeContent,
  getToneTips,
  generateVoiceReport
};
