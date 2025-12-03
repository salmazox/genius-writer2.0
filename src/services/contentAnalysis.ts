/**
 * Content Analysis Service
 *
 * Provides comprehensive content quality analysis including:
 * - Readability scoring (Flesch Reading Ease, Grade Level)
 * - Tone analysis (Professional, Casual, Formal, etc.)
 * - Sentiment analysis (Positive, Negative, Neutral)
 * - Word complexity analysis
 * - Sentence structure analysis
 */

export interface ReadabilityScore {
  fleschReadingEase: number; // 0-100, higher is easier
  fleschKincaidGrade: number; // US grade level
  readingLevel: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult' | 'Very Difficult';
  averageSentenceLength: number;
  averageWordLength: number;
  complexWordPercentage: number;
  recommendations: string[];
}

export interface ToneAnalysis {
  primaryTone: 'Professional' | 'Casual' | 'Formal' | 'Friendly' | 'Technical' | 'Creative' | 'Academic';
  confidence: number; // 0-100
  characteristics: string[];
  suggestions: string[];
}

export interface SentimentAnalysis {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number; // -1 to 1
  emotionalWords: { word: string; sentiment: string }[];
}

export interface ContentQualityReport {
  readability: ReadabilityScore;
  tone: ToneAnalysis;
  sentiment: SentimentAnalysis;
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  uniqueWords: number;
  overallScore: number; // 0-100
}

// ============================================================================
// READABILITY ANALYSIS
// ============================================================================

/**
 * Calculate Flesch Reading Ease Score
 * Formula: 206.835 - 1.015(total words/total sentences) - 84.6(total syllables/total words)
 * Score interpretation:
 * 90-100: Very Easy (5th grade)
 * 80-89: Easy (6th grade)
 * 70-79: Fairly Easy (7th grade)
 * 60-69: Standard (8th-9th grade)
 * 50-59: Fairly Difficult (10th-12th grade)
 * 30-49: Difficult (College)
 * 0-29: Very Difficult (College graduate)
 */
function calculateFleschReadingEase(text: string): number {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = countSyllables(text);

  if (words === 0 || sentences === 0) return 0;

  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Formula: 0.39(total words/total sentences) + 11.8(total syllables/total words) - 15.59
 */
function calculateFleschKincaidGrade(text: string): number {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = countSyllables(text);

  if (words === 0 || sentences === 0) return 0;

  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  return Math.max(0, grade);
}

function getReadingLevel(score: number): ReadabilityScore['readingLevel'] {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Difficult';
}

export function analyzeReadability(text: string): ReadabilityScore {
  if (!text || text.trim().length === 0) {
    return {
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      readingLevel: 'Standard',
      averageSentenceLength: 0,
      averageWordLength: 0,
      complexWordPercentage: 0,
      recommendations: ['Add content to analyze readability']
    };
  }

  const fleschScore = calculateFleschReadingEase(text);
  const gradeLevel = calculateFleschKincaidGrade(text);
  const words: string[] = text.match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const avgSentenceLength = words.length / Math.max(1, sentences.length);
  const avgWordLength = words.length > 0
    ? words.reduce((sum: number, w: string) => sum + w.length, 0) / words.length
    : 0;

  // Complex words are 3+ syllables
  const complexWords = words.filter(w => countSyllablesInWord(w) >= 3);
  const complexWordPercentage = (complexWords.length / Math.max(1, words.length)) * 100;

  const recommendations: string[] = [];

  if (fleschScore < 60) {
    recommendations.push('Consider using shorter sentences to improve readability');
  }
  if (avgSentenceLength > 25) {
    recommendations.push('Average sentence length is high. Break long sentences into shorter ones');
  }
  if (complexWordPercentage > 20) {
    recommendations.push('High percentage of complex words. Consider using simpler alternatives');
  }
  if (gradeLevel > 12) {
    recommendations.push('Reading level is quite advanced. Simplify vocabulary for wider audience');
  }
  if (recommendations.length === 0) {
    recommendations.push('Readability is good! Content is clear and accessible');
  }

  return {
    fleschReadingEase: Math.round(fleschScore),
    fleschKincaidGrade: Math.round(gradeLevel * 10) / 10,
    readingLevel: getReadingLevel(fleschScore),
    averageSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    averageWordLength: Math.round(avgWordLength * 10) / 10,
    complexWordPercentage: Math.round(complexWordPercentage * 10) / 10,
    recommendations
  };
}

// ============================================================================
// TONE ANALYSIS
// ============================================================================

const TONE_INDICATORS = {
  Professional: {
    keywords: ['expertise', 'experience', 'proficiency', 'accomplished', 'demonstrated', 'collaborated', 'managed', 'developed', 'implemented', 'achieved'],
    patterns: /\b(led|managed|developed|implemented|achieved|accomplished|coordinated|facilitated)\b/gi,
    avoids: ['awesome', 'cool', 'stuff', 'things', 'kinda', 'sorta']
  },
  Casual: {
    keywords: ['hey', 'cool', 'awesome', 'great', 'nice', 'stuff', 'things', 'got', 'want', 'need'],
    patterns: /\b(hey|cool|awesome|great|stuff|things|got|gonna|wanna)\b/gi,
    avoids: ['henceforth', 'aforementioned', 'pursuant']
  },
  Formal: {
    keywords: ['furthermore', 'therefore', 'consequently', 'henceforth', 'aforementioned', 'pursuant', 'heretofore'],
    patterns: /\b(furthermore|therefore|consequently|moreover|henceforth|pursuant)\b/gi,
    avoids: ['cool', 'awesome', 'stuff']
  },
  Friendly: {
    keywords: ['happy', 'excited', 'love', 'enjoy', 'wonderful', 'fantastic', 'delighted', 'pleased'],
    patterns: /\b(happy|excited|love|enjoy|wonderful|fantastic|delighted)\b/gi,
    avoids: ['difficult', 'problem', 'issue']
  },
  Technical: {
    keywords: ['algorithm', 'implementation', 'optimization', 'architecture', 'methodology', 'framework', 'protocol', 'interface'],
    patterns: /\b(algorithm|implementation|optimization|architecture|methodology|framework|protocol|interface|API|database)\b/gi,
    avoids: ['feel', 'believe', 'think']
  },
  Creative: {
    keywords: ['innovative', 'creative', 'unique', 'imaginative', 'original', 'inspired', 'vision', 'craft'],
    patterns: /\b(innovative|creative|unique|imaginative|original|inspired|vision|craft|design)\b/gi,
    avoids: ['standard', 'typical', 'usual']
  },
  Academic: {
    keywords: ['research', 'study', 'analysis', 'hypothesis', 'methodology', 'evidence', 'data', 'findings'],
    patterns: /\b(research|study|analysis|hypothesis|methodology|evidence|findings|according to)\b/gi,
    avoids: ['i think', 'cool', 'awesome']
  }
};

export function analyzeTone(text: string): ToneAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      primaryTone: 'Professional',
      confidence: 0,
      characteristics: [],
      suggestions: ['Add content to analyze tone']
    };
  }

  const lowerText = text.toLowerCase();
  const toneScores: Record<string, number> = {};

  // Score each tone
  for (const [tone, indicators] of Object.entries(TONE_INDICATORS)) {
    let score = 0;

    // Check keywords
    for (const keyword of indicators.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
    }

    // Check patterns
    const patternMatches = text.match(indicators.patterns);
    if (patternMatches) {
      score += patternMatches.length * 3;
    }

    // Penalize for avoided words
    for (const avoided of indicators.avoids) {
      const regex = new RegExp(`\\b${avoided}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score -= matches.length * 2;
      }
    }

    toneScores[tone] = Math.max(0, score);
  }

  // Find primary tone
  const sortedTones = Object.entries(toneScores).sort((a, b) => b[1] - a[1]);
  const primaryTone = (sortedTones[0]?.[0] || 'Professional') as ToneAnalysis['primaryTone'];
  const maxScore = sortedTones[0]?.[1] || 0;
  const totalScore = Object.values(toneScores).reduce((sum, s) => sum + s, 0);

  const confidence = totalScore > 0 ? Math.min(100, (maxScore / totalScore) * 100) : 50;

  // Get characteristics (tones with significant scores)
  const characteristics = sortedTones
    .filter(([_, score]) => score > maxScore * 0.3)
    .map(([tone]) => tone)
    .slice(0, 3);

  // Generate suggestions
  const suggestions: string[] = [];

  if (primaryTone === 'Professional') {
    suggestions.push('Tone is professional and appropriate for business contexts');
    if (toneScores.Casual > maxScore * 0.5) {
      suggestions.push('Consider reducing casual language for more formal contexts');
    }
  } else if (primaryTone === 'Casual') {
    suggestions.push('Tone is casual and conversational');
    suggestions.push('For professional documents, consider using more formal language');
  } else if (primaryTone === 'Formal') {
    suggestions.push('Tone is very formal');
    suggestions.push('Consider making language more accessible for general audiences');
  } else if (primaryTone === 'Technical') {
    suggestions.push('Tone is technical and specialized');
    suggestions.push('Ensure technical terms are necessary for your audience');
  }

  if (confidence < 60) {
    suggestions.push('Tone is mixed - consider focusing on a more consistent voice');
  }

  return {
    primaryTone,
    confidence: Math.round(confidence),
    characteristics,
    suggestions
  };
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

const SENTIMENT_WORDS = {
  positive: [
    'excellent', 'great', 'good', 'wonderful', 'fantastic', 'amazing', 'outstanding', 'superb',
    'success', 'successful', 'achieved', 'accomplished', 'improved', 'enhanced', 'optimized',
    'innovative', 'creative', 'effective', 'efficient', 'strong', 'powerful', 'leading',
    'happy', 'excited', 'pleased', 'delighted', 'satisfied', 'proud', 'confident'
  ],
  negative: [
    'bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing', 'failed', 'failure',
    'problem', 'issue', 'difficult', 'challenge', 'struggle', 'weak', 'ineffective',
    'unfortunately', 'sadly', 'regret', 'worry', 'concern', 'difficult', 'hard'
  ],
  neutral: [
    'work', 'project', 'task', 'process', 'system', 'data', 'information', 'report',
    'meeting', 'discussion', 'review', 'analysis', 'document', 'file', 'record'
  ]
};

export function analyzeSentiment(text: string): SentimentAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      sentiment: 'Neutral',
      score: 0,
      emotionalWords: []
    };
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.match(/\b\w+\b/g) || [];

  let positiveCount = 0;
  let negativeCount = 0;
  const emotionalWords: { word: string; sentiment: string }[] = [];

  // Count sentiment words
  for (const word of words) {
    if (SENTIMENT_WORDS.positive.includes(word)) {
      positiveCount++;
      emotionalWords.push({ word, sentiment: 'positive' });
    } else if (SENTIMENT_WORDS.negative.includes(word)) {
      negativeCount++;
      emotionalWords.push({ word, sentiment: 'negative' });
    }
  }

  // Calculate sentiment score (-1 to 1)
  const totalEmotional = positiveCount + negativeCount;
  let score = 0;

  if (totalEmotional > 0) {
    score = (positiveCount - negativeCount) / words.length;
  }

  // Determine overall sentiment
  let sentiment: SentimentAnalysis['sentiment'];
  if (score > 0.02) {
    sentiment = 'Positive';
  } else if (score < -0.02) {
    sentiment = 'Negative';
  } else {
    sentiment = 'Neutral';
  }

  return {
    sentiment,
    score: Math.round(score * 100) / 100,
    emotionalWords: emotionalWords.slice(0, 10) // Limit to top 10
  };
}

// ============================================================================
// COMPREHENSIVE ANALYSIS
// ============================================================================

export function analyzeContent(text: string): ContentQualityReport {
  const readability = analyzeReadability(text);
  const tone = analyzeTone(text);
  const sentiment = analyzeSentiment(text);

  const words = text.match(/\b\w+\b/g) || [];
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Calculate overall score (0-100)
  let overallScore = 0;

  // Readability contributes 40%
  overallScore += (readability.fleschReadingEase / 100) * 40;

  // Tone confidence contributes 30%
  overallScore += (tone.confidence / 100) * 30;

  // Appropriate word count contributes 20%
  const wordCountScore = words.length >= 50 && words.length <= 1000 ? 100 :
    words.length < 50 ? (words.length / 50) * 100 :
    Math.max(0, 100 - ((words.length - 1000) / 50));
  overallScore += (wordCountScore / 100) * 20;

  // Unique vocabulary contributes 10%
  const vocabularyScore = uniqueWords > 0 ? Math.min(100, (uniqueWords / words.length) * 150) : 0;
  overallScore += (vocabularyScore / 100) * 10;

  return {
    readability,
    tone,
    sentiment,
    wordCount: words.length,
    characterCount: text.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    uniqueWords,
    overallScore: Math.round(overallScore)
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function countWords(text: string): number {
  const words = text.match(/\b\w+\b/g);
  return words ? words.length : 0;
}

function countSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return Math.max(1, sentences.length);
}

function countSyllables(text: string): number {
  const words: string[] = text.match(/\b\w+\b/g) || [];
  return words.reduce((total: number, word: string) => total + countSyllablesInWord(word), 0);
}

function countSyllablesInWord(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  // Remove non-alphabetic characters
  word = word.replace(/[^a-z]/g, '');

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let syllables = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent e at the end
  if (word.endsWith('e')) {
    syllables--;
  }

  // Adjust for special endings
  if (word.endsWith('le') && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) {
    syllables++;
  }

  return Math.max(1, syllables);
}
