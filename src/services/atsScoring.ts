/**
 * ATS Scoring Engine
 *
 * Multi-criteria analysis system for CV/Resume optimization
 * Provides real-time scoring across 6 key dimensions that ATS systems evaluate.
 */

import type { CVData } from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ScoreCriterion {
  score: number; // 0-100
  weight: number; // Percentage weight in overall score
  details: string[]; // Specific findings/issues
  passed: boolean; // Whether this criterion meets minimum threshold
}

export interface ATSScoreBreakdown {
  overall: number; // 0-100 weighted average
  criteria: {
    keywords: ScoreCriterion;
    formatting: ScoreCriterion;
    quantification: ScoreCriterion;
    actionVerbs: ScoreCriterion;
    length: ScoreCriterion;
    structure: ScoreCriterion;
  };
  suggestions: string[]; // Actionable improvement suggestions
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor'; // Human-readable grade
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STRONG_ACTION_VERBS = [
  // Leadership
  'led', 'managed', 'directed', 'supervised', 'coordinated', 'orchestrated', 'spearheaded',
  // Achievement
  'achieved', 'accomplished', 'delivered', 'exceeded', 'surpassed', 'outperformed',
  // Growth
  'increased', 'improved', 'enhanced', 'optimized', 'maximized', 'boosted', 'elevated',
  // Creation
  'created', 'developed', 'designed', 'built', 'launched', 'established', 'founded',
  // Efficiency
  'streamlined', 'automated', 'simplified', 'reduced', 'eliminated', 'consolidated',
  // Analysis
  'analyzed', 'evaluated', 'assessed', 'researched', 'investigated', 'identified',
  // Strategy
  'strategized', 'planned', 'implemented', 'executed', 'initiated', 'pioneered',
  // Collaboration
  'collaborated', 'partnered', 'facilitated', 'mentored', 'trained', 'coached',
  // Technical
  'engineered', 'programmed', 'architected', 'deployed', 'configured', 'integrated'
];

const WEAK_PHRASES = [
  'responsible for',
  'worked on',
  'helped with',
  'assisted with',
  'participated in',
  'involved in',
  'tasked with',
  'duties included',
  'was responsible',
  'in charge of'
];

const QUANTIFICATION_PATTERNS = [
  /\d+%/g, // Percentages: 30%
  /\$\d+[kmb]?/gi, // Money: $50k, $1M
  /\d+\+?\s*(users?|customers?|clients?|people|employees?|members?)/gi,
  /\d+\+?\s*(projects?|products?|features?|applications?)/gi,
  /\d+\+?\s*(years?|months?|weeks?)/gi,
  /\d+x/gi, // Multipliers: 3x faster
  /increased?.*?by\s+\d+/gi,
  /reduced?.*?by\s+\d+/gi,
  /grew.*?from\s+\d+.*?to\s+\d+/gi,
  /\d+\+?\s*(million|thousand|billion)/gi
];

const COMMON_TECH_KEYWORDS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin',
  // Frameworks
  'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform', 'ansible',
  // Databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle',
  // Methodologies
  'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'api', 'rest', 'graphql',
  // Soft Skills
  'leadership', 'communication', 'collaboration', 'problem-solving', 'analytical', 'strategic'
];

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Calculate comprehensive ATS score for a CV
 *
 * @param cvData - The complete CV data structure
 * @param jobDescription - Optional job description for keyword matching
 * @returns Detailed score breakdown with suggestions
 */
export const calculateRealTimeATSScore = (
  cvData: CVData,
  jobDescription?: string
): ATSScoreBreakdown => {
  // Calculate individual criteria scores
  const keywordScore = analyzeKeywordDensity(cvData, jobDescription);
  const formatScore = checkFormatting(cvData);
  const quantScore = detectQuantifications(cvData);
  const verbScore = analyzeActionVerbs(cvData);
  const lengthScore = checkOptimalLength(cvData);
  const structureScore = validateStructure(cvData);

  // Calculate weighted overall score
  const overall = Math.round(
    keywordScore.score * (keywordScore.weight / 100) +
    formatScore.score * (formatScore.weight / 100) +
    quantScore.score * (quantScore.weight / 100) +
    verbScore.score * (verbScore.weight / 100) +
    lengthScore.score * (lengthScore.weight / 100) +
    structureScore.score * (structureScore.weight / 100)
  );

  // Generate actionable suggestions
  const suggestions = generateSuggestions({
    keywords: keywordScore,
    formatting: formatScore,
    quantification: quantScore,
    actionVerbs: verbScore,
    length: lengthScore,
    structure: structureScore
  });

  // Determine grade
  const grade = overall >= 85 ? 'Excellent' :
                overall >= 70 ? 'Good' :
                overall >= 50 ? 'Fair' : 'Poor';

  return {
    overall,
    criteria: {
      keywords: keywordScore,
      formatting: formatScore,
      quantification: quantScore,
      actionVerbs: verbScore,
      length: lengthScore,
      structure: structureScore
    },
    suggestions,
    grade
  };
};

// ============================================================================
// SCORING FUNCTIONS (Individual Criteria)
// ============================================================================

/**
 * Analyze keyword density and relevance (25% weight)
 * Checks for industry-relevant keywords and job description matches
 */
function analyzeKeywordDensity(cvData: CVData, jobDescription?: string): ScoreCriterion {
  const allText = extractAllText(cvData).toLowerCase();
  const details: string[] = [];
  let score = 50; // Base score

  // Check for common tech/professional keywords
  const foundKeywords = COMMON_TECH_KEYWORDS.filter(keyword =>
    allText.includes(keyword.toLowerCase())
  );

  const keywordDensity = foundKeywords.length / COMMON_TECH_KEYWORDS.length;
  score += Math.min(keywordDensity * 100, 30); // Up to +30 points

  if (foundKeywords.length < 5) {
    details.push('Add more industry-specific keywords to improve ATS visibility');
  } else if (foundKeywords.length < 10) {
    details.push(`Good keyword usage (${foundKeywords.length} found), consider adding more specific technologies`);
  } else {
    details.push(`Excellent keyword coverage (${foundKeywords.length} industry terms found)`);
  }

  // If job description provided, analyze matching
  if (jobDescription) {
    const jdKeywords = extractKeywordsFromJobDescription(jobDescription);
    const matchedKeywords = jdKeywords.filter(keyword =>
      allText.includes(keyword.toLowerCase())
    );

    const matchRate = jdKeywords.length > 0 ? matchedKeywords.length / jdKeywords.length : 0;
    score += Math.min(matchRate * 20, 20); // Up to +20 points

    const missingKeywords = jdKeywords.filter(k => !matchedKeywords.includes(k));
    if (missingKeywords.length > 0) {
      details.push(`Missing from job description: ${missingKeywords.slice(0, 5).join(', ')}`);
    } else if (jdKeywords.length > 0) {
      details.push('Excellent match with job description keywords');
    }
  } else {
    details.push('Upload job description for keyword matching analysis');
  }

  // Check skills section
  if (cvData.skills.length < 5) {
    details.push('Add more skills (aim for 10-15 skills)');
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    weight: 25,
    details,
    passed: score >= 60
  };
}

/**
 * Check CV formatting quality (20% weight)
 * Validates contact info, dates, structure consistency
 */
function checkFormatting(cvData: CVData): ScoreCriterion {
  const details: string[] = [];
  let score = 100; // Start perfect, deduct for issues

  // Contact information validation
  if (!cvData.personal.email || !cvData.personal.email.includes('@')) {
    details.push('Missing or invalid email address');
    score -= 15;
  }

  if (!cvData.personal.phone || cvData.personal.phone.length < 10) {
    details.push('Missing or incomplete phone number');
    score -= 10;
  }

  if (!cvData.personal.fullName || cvData.personal.fullName.trim().split(' ').length < 2) {
    details.push('Full name should include first and last name');
    score -= 10;
  }

  // Date formatting consistency
  const dateInconsistencies = checkDateConsistency(cvData.experience);
  if (dateInconsistencies.length > 0) {
    details.push(`Date format inconsistencies: ${dateInconsistencies.join(', ')}`);
    score -= 10;
  }

  // Check for empty descriptions
  const emptyDescriptions = cvData.experience.filter(exp =>
    !exp.description || exp.description.trim().length < 20
  );
  if (emptyDescriptions.length > 0) {
    details.push(`${emptyDescriptions.length} experience(s) missing detailed descriptions`);
    score -= emptyDescriptions.length * 10;
  }

  // Professional formatting checks
  if (cvData.personal.linkedin && !cvData.personal.linkedin.includes('linkedin.com')) {
    details.push('LinkedIn URL format appears incorrect');
    score -= 5;
  }

  if (cvData.personal.website && !cvData.personal.website.startsWith('http')) {
    details.push('Website URL should include http:// or https://');
    score -= 5;
  }

  if (details.length === 0) {
    details.push('Excellent formatting - all fields properly structured');
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    weight: 20,
    details,
    passed: score >= 70
  };
}

/**
 * Detect quantifiable achievements (15% weight)
 * Looks for numbers, percentages, metrics in experience descriptions
 */
function detectQuantifications(cvData: CVData): ScoreCriterion {
  const details: string[] = [];
  let totalBullets = 0;
  let quantifiedBullets = 0;

  cvData.experience.forEach(exp => {
    // Count bullet points (approximate by splitting on common delimiters)
    const bullets = exp.description.split(/<li>|<\/li>|\n|•/).filter(b => b.trim().length > 10);
    totalBullets += bullets.length;

    bullets.forEach(bullet => {
      const hasQuantification = QUANTIFICATION_PATTERNS.some(pattern => pattern.test(bullet));
      if (hasQuantification) {
        quantifiedBullets++;
      }
    });
  });

  const quantificationRate = totalBullets > 0 ? quantifiedBullets / totalBullets : 0;
  const score = Math.round(quantificationRate * 100);

  if (quantificationRate === 0) {
    details.push('❌ No quantified achievements found - add numbers, percentages, or metrics');
  } else if (quantificationRate < 0.3) {
    details.push(`⚠️ Only ${Math.round(quantificationRate * 100)}% of achievements are quantified`);
    details.push('Example: "Increased sales by 30%" instead of "Improved sales"');
  } else if (quantificationRate < 0.6) {
    details.push(`✓ ${Math.round(quantificationRate * 100)}% quantified - good progress!`);
    details.push('Try to add metrics to more achievements');
  } else {
    details.push(`✓ Excellent! ${Math.round(quantificationRate * 100)}% of achievements include metrics`);
  }

  details.push(`Found ${quantifiedBullets} quantified achievements out of ${totalBullets} total`);

  return {
    score: Math.max(0, Math.min(100, score)),
    weight: 15,
    details,
    passed: score >= 50
  };
}

/**
 * Analyze action verb usage (15% weight)
 * Checks for strong vs weak verbs, passive voice avoidance
 */
function analyzeActionVerbs(cvData: CVData): ScoreCriterion {
  const details: string[] = [];
  const allExperienceText = cvData.experience
    .map(exp => exp.description)
    .join(' ')
    .toLowerCase();

  // Count strong action verbs
  const strongVerbsFound = STRONG_ACTION_VERBS.filter(verb =>
    new RegExp(`\\b${verb}\\b`, 'i').test(allExperienceText)
  ).length;

  // Count weak phrases
  const weakPhrasesFound = WEAK_PHRASES.filter(phrase =>
    allExperienceText.includes(phrase.toLowerCase())
  );

  // Calculate score
  let score = 50; // Base score
  score += Math.min(strongVerbsFound * 3, 40); // Up to +40 for strong verbs
  score -= weakPhrasesFound.length * 10; // -10 per weak phrase

  if (weakPhrasesFound.length > 0) {
    details.push(`❌ Found ${weakPhrasesFound.length} weak phrases: "${weakPhrasesFound.slice(0, 2).join('", "')}"${weakPhrasesFound.length > 2 ? '...' : ''}`);
    details.push('Replace with strong action verbs like: Led, Achieved, Optimized');
  }

  if (strongVerbsFound < 5) {
    details.push('⚠️ Use more strong action verbs to start your bullet points');
  } else if (strongVerbsFound < 10) {
    details.push(`✓ Good use of action verbs (${strongVerbsFound} found)`);
  } else {
    details.push(`✓ Excellent action verb usage (${strongVerbsFound} strong verbs)`);
  }

  // Check for passive voice indicators
  const passiveIndicators = ['was', 'were', 'been', 'being'];
  const passiveCount = passiveIndicators.reduce((count, indicator) =>
    count + (allExperienceText.match(new RegExp(`\\b${indicator}\\b`, 'g')) || []).length, 0
  );

  if (passiveCount > 5) {
    details.push('⚠️ Reduce passive voice - use active voice for stronger impact');
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    weight: 15,
    details,
    passed: score >= 60
  };
}

/**
 * Check optimal CV length (10% weight)
 * Validates word count is in ideal range (400-800 words)
 */
function checkOptimalLength(cvData: CVData): ScoreCriterion {
  const details: string[] = [];
  const allText = extractAllText(cvData);
  const wordCount = allText.split(/\s+/).filter(word => word.length > 0).length;

  let score = 100;

  if (wordCount < 300) {
    score = Math.round((wordCount / 300) * 50); // Scale 0-50 for very short CVs
    details.push(`❌ CV is too short (${wordCount} words). Aim for 400-800 words`);
    details.push('Add more detailed descriptions of your achievements');
  } else if (wordCount < 400) {
    score = 70;
    details.push(`⚠️ CV is somewhat short (${wordCount} words). Add more details`);
  } else if (wordCount <= 800) {
    score = 100;
    details.push(`✓ Excellent length (${wordCount} words) - optimal for ATS systems`);
  } else if (wordCount <= 1000) {
    score = 85;
    details.push(`✓ Good length (${wordCount} words) but slightly long. Consider condensing`);
  } else {
    score = 60;
    details.push(`⚠️ CV is too long (${wordCount} words). Aim for 400-800 words`);
    details.push('Focus on most recent and relevant experiences');
  }

  return {
    score,
    weight: 10,
    details,
    passed: score >= 70
  };
}

/**
 * Validate CV structure (15% weight)
 * Checks for proper sections, hierarchy, completeness
 */
function validateStructure(cvData: CVData): ScoreCriterion {
  const details: string[] = [];
  let score = 100;

  // Required sections check
  if (!cvData.personal.summary || cvData.personal.summary.trim().length < 50) {
    details.push('❌ Missing or too short professional summary (aim for 50-100 words)');
    score -= 20;
  }

  if (cvData.experience.length === 0) {
    details.push('❌ No work experience added');
    score -= 30;
  } else if (cvData.experience.length < 2) {
    details.push('⚠️ Add more work experience entries for better profile');
    score -= 10;
  }

  if (cvData.education.length === 0) {
    details.push('⚠️ No education entries - consider adding your educational background');
    score -= 15;
  }

  if (cvData.skills.length === 0) {
    details.push('❌ No skills listed - this is critical for ATS matching');
    score -= 25;
  } else if (cvData.skills.length < 8) {
    details.push('⚠️ Add more skills (most competitive CVs have 10-15 skills)');
    score -= 10;
  }

  // Professional completeness
  if (!cvData.personal.jobTitle) {
    details.push('⚠️ Missing professional title/headline');
    score -= 10;
  }

  if (!cvData.personal.linkedin && !cvData.personal.website) {
    details.push('⚠️ Add LinkedIn profile or personal website for credibility');
    score -= 5;
  }

  // Experience quality checks
  const recentExperienceCount = cvData.experience.filter(exp => {
    const endYear = exp.current ? new Date().getFullYear() : parseInt(exp.endDate);
    return endYear >= new Date().getFullYear() - 5;
  }).length;

  if (recentExperienceCount === 0 && cvData.experience.length > 0) {
    details.push('⚠️ Focus on recent experience (last 5 years is most relevant)');
  }

  if (details.length === 0) {
    details.push('✓ Excellent structure - all key sections complete');
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    weight: 15,
    details,
    passed: score >= 70
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract all text content from CV for analysis
 */
function extractAllText(cvData: CVData): string {
  const parts: string[] = [
    cvData.personal.fullName,
    cvData.personal.jobTitle,
    cvData.personal.summary,
    ...cvData.experience.map(exp => `${exp.title} ${exp.company} ${exp.description}`),
    ...cvData.education.map(edu => `${edu.degree} ${edu.school}`),
    ...cvData.skills,
    ...cvData.certifications.map(cert => `${cert.name} ${cert.description}`),
    ...cvData.languages.map(lang => lang.language)
  ];

  return parts.filter(Boolean).join(' ');
}

/**
 * Extract keywords from job description text
 */
function extractKeywordsFromJobDescription(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();
  const keywords: string[] = [];

  // Extract technical keywords
  COMMON_TECH_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });

  // Extract custom keywords (words appearing multiple times)
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4); // Only words longer than 4 chars

  const wordFrequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Add words that appear 2+ times and aren't common stopwords
  const stopwords = ['about', 'after', 'before', 'being', 'could', 'during', 'every', 'other', 'should', 'their', 'there', 'these', 'those', 'through', 'under', 'where', 'which', 'while', 'would'];

  Object.entries(wordFrequency).forEach(([word, count]) => {
    if (count >= 2 && !stopwords.includes(word) && !keywords.includes(word)) {
      keywords.push(word);
    }
  });

  return [...new Set(keywords)].slice(0, 20); // Unique, max 20 keywords
}

/**
 * Check for date formatting consistency
 */
function checkDateConsistency(experiences: CVData['experience']): string[] {
  const issues: string[] = [];
  const dateFormats = experiences.map(exp => {
    const startFormat = detectDateFormat(exp.startDate);
    const endFormat = exp.current ? startFormat : detectDateFormat(exp.endDate);
    return { startFormat, endFormat };
  });

  const uniqueFormats = new Set(dateFormats.map(d => d.startFormat));
  if (uniqueFormats.size > 1) {
    issues.push('Inconsistent date formats across experiences');
  }

  return issues;
}

/**
 * Detect date format pattern
 */
function detectDateFormat(date: string): string {
  if (/^\d{4}$/.test(date)) return 'YYYY';
  if (/^\d{2}\/\d{4}$/.test(date)) return 'MM/YYYY';
  if (/^[A-Za-z]+\s+\d{4}$/.test(date)) return 'Month YYYY';
  return 'OTHER';
}

/**
 * Generate actionable suggestions based on all criteria
 */
function generateSuggestions(criteria: ATSScoreBreakdown['criteria']): string[] {
  const suggestions: string[] = [];

  // Priority suggestions (failed criteria)
  if (!criteria.keywords.passed) {
    suggestions.push('🎯 HIGH PRIORITY: Add more industry-specific keywords to improve ATS matching');
  }
  if (!criteria.quantification.passed) {
    suggestions.push('📊 HIGH PRIORITY: Quantify your achievements with numbers, percentages, and metrics');
  }
  if (!criteria.actionVerbs.passed) {
    suggestions.push('💪 HIGH PRIORITY: Replace weak phrases with strong action verbs (Led, Achieved, Optimized)');
  }
  if (!criteria.structure.passed) {
    suggestions.push('🏗️ HIGH PRIORITY: Complete all key sections (Summary, Experience, Skills, Education)');
  }

  // Secondary suggestions (low scoring criteria)
  if (criteria.formatting.score < 80) {
    suggestions.push('✏️ Fix formatting issues with contact info, dates, or descriptions');
  }
  if (criteria.length.score < 70) {
    suggestions.push('📝 Adjust CV length to optimal range (400-800 words)');
  }

  // If all good, provide advanced tips
  if (suggestions.length === 0) {
    suggestions.push('🎉 Great job! Your CV is well-optimized for ATS systems');
    suggestions.push('💡 Consider tailoring keywords for specific job applications');
    suggestions.push('🔍 Use the AI Co-Pilot for further personalized suggestions');
  }

  return suggestions.slice(0, 5); // Max 5 suggestions to avoid overwhelming
}
