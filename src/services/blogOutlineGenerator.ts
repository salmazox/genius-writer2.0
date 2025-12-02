/**
 * Blog Outline Generator Service
 *
 * Generates structured blog outlines that users can edit before
 * generating the full blog content. This provides better control
 * over blog structure and improves content quality.
 */

import { ToolType } from '../types';
import { generateContent } from './gemini';

export interface BlogSection {
  id: string;
  heading: string; // H2 heading
  subheadings: string[]; // H3 subheadings
  keyPoints: string[]; // Key points to cover in this section
  estimatedWords?: number;
}

export interface BlogOutline {
  title: string;
  metaDescription: string;
  introduction: string;
  sections: BlogSection[];
  conclusion: string;
  targetKeywords: string[];
  estimatedReadTime: number;
  tone?: string;
}

/**
 * Generate a blog outline from topic and keywords
 */
export async function generateBlogOutline(
  topic: string,
  keywords: string[],
  options?: {
    tone?: string;
    targetLength?: 'short' | 'medium' | 'long'; // ~500, ~1500, ~2500 words
    audience?: string;
    includeKeyPoints?: boolean;
  }
): Promise<BlogOutline> {
  const {
    tone = 'professional',
    targetLength = 'medium',
    audience = 'general',
    includeKeyPoints = true
  } = options || {};

  const lengthGuidelines = {
    short: { words: 500, sections: 3, wordsPerSection: 150 },
    medium: { words: 1500, sections: 5, wordsPerSection: 250 },
    long: { words: 2500, sections: 7, wordsPerSection: 300 }
  };

  const guidelines = lengthGuidelines[targetLength];

  const prompt = `
Generate a comprehensive blog outline for the following topic:

TOPIC: "${topic}"
TARGET KEYWORDS: ${keywords.join(', ')}
TONE: ${tone}
TARGET LENGTH: ${guidelines.words} words (${guidelines.sections} main sections)
AUDIENCE: ${audience}

Create a structured outline with:

1. **SEO-Optimized Title** (60 characters max, include primary keyword)
2. **Meta Description** (120-160 characters, compelling, keyword-rich)
3. **Introduction** (What the blog will cover, why it matters)
4. **${guidelines.sections} Main Sections** (H2 headings):
   - Each section should have 2-3 H3 subheadings
   ${includeKeyPoints ? '- Include 3-5 key points to cover in each section' : ''}
   - Estimate ~${guidelines.wordsPerSection} words per section
5. **Conclusion** (Summary and call-to-action)

IMPORTANT GUIDELINES:
- Title must be compelling and SEO-friendly
- Section headings should be clear and descriptive
- Include natural keyword placement in headings
- Ensure logical flow between sections
- Target keywords: ${keywords.join(', ')}

Return ONLY valid JSON in this exact format:
{
  "title": "How to Master Content Marketing in 2024",
  "metaDescription": "Discover proven content marketing strategies...",
  "introduction": "Brief overview of what readers will learn...",
  "sections": [
    {
      "heading": "Understanding Content Marketing Fundamentals",
      "subheadings": [
        "What is Content Marketing?",
        "Why Content Marketing Matters",
        "Key Content Marketing Metrics"
      ],
      "keyPoints": [
        "Define content marketing and its core principles",
        "Explain the business value and ROI potential",
        "Introduce essential KPIs to track success"
      ],
      "estimatedWords": ${guidelines.wordsPerSection}
    }
  ],
  "conclusion": "Summary and next steps...",
  "targetKeywords": ${JSON.stringify(keywords)},
  "estimatedReadTime": ${Math.ceil(guidelines.words / 200)},
  "tone": "${tone}"
}

Return JSON only, no markdown formatting, no additional text.
`;

  try {
    const response = await generateContent(ToolType.BLOG_FULL, { content: prompt });
    const cleaned = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned) as BlogOutline;

    // Add IDs to sections
    parsed.sections = parsed.sections.map((section, idx) => ({
      ...section,
      id: `section_${Date.now()}_${idx}`
    }));

    return parsed;
  } catch (error) {
    console.error('Blog outline generation failed:', error);
    throw new Error('Failed to generate blog outline');
  }
}

/**
 * Generate full blog content from an edited outline
 */
export async function generateBlogFromOutline(
  outline: BlogOutline,
  options?: {
    includeImages?: boolean;
    internalLinks?: string[];
    tone?: string;
  }
): Promise<string> {
  const { includeImages = false, internalLinks = [], tone } = options || {};

  const sectionsText = outline.sections
    .map(
      (section) => `
## ${section.heading}

${section.subheadings.map((sub) => `### ${sub}`).join('\n\n')}

KEY POINTS TO COVER:
${section.keyPoints.map((point) => `- ${point}`).join('\n')}

Target word count: ~${section.estimatedWords} words
`
    )
    .join('\n\n---\n\n');

  const prompt = `
Write a complete, engaging blog post based on this detailed outline:

# ${outline.title}

META DESCRIPTION: ${outline.metaDescription}

## Introduction
${outline.introduction}

${sectionsText}

## Conclusion
${outline.conclusion}

---

WRITING GUIDELINES:
- Tone: ${tone || outline.tone || 'professional'}
- Target keywords: ${outline.targetKeywords.join(', ')}
- Include keywords naturally throughout the content
- Write engaging, conversational prose
- Use examples and analogies where appropriate
- Break up long paragraphs (3-4 sentences max)
- Use transition sentences between sections
${includeImages ? '- Suggest image placements with [IMAGE: description]' : ''}
${internalLinks.length > 0 ? `- Include these internal links naturally: ${internalLinks.join(', ')}` : ''}

IMPORTANT:
- Follow the outline structure exactly
- Maintain consistent voice throughout
- Each section should flow logically to the next
- Conclusion should summarize key takeaways and include a clear CTA
- Total length: ~${outline.sections.reduce((sum, s) => sum + (s.estimatedWords || 0), 0)} words

Return the blog post in markdown format with proper heading hierarchy (H1 for title, H2 for sections, H3 for subsections).
`;

  try {
    const blogContent = await generateContent(ToolType.BLOG_FULL, { content: prompt });
    return blogContent;
  } catch (error) {
    console.error('Blog generation from outline failed:', error);
    throw new Error('Failed to generate blog from outline');
  }
}

/**
 * Validate a blog outline
 */
export function validateOutline(outline: BlogOutline): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check title
  if (!outline.title || outline.title.length === 0) {
    errors.push('Title is required');
  } else if (outline.title.length > 70) {
    warnings.push('Title is too long for SEO (recommended: 60 characters)');
  }

  // Check meta description
  if (!outline.metaDescription) {
    errors.push('Meta description is required');
  } else if (outline.metaDescription.length < 120 || outline.metaDescription.length > 160) {
    warnings.push('Meta description should be 120-160 characters for optimal SEO');
  }

  // Check sections
  if (!outline.sections || outline.sections.length === 0) {
    errors.push('At least one section is required');
  } else if (outline.sections.length < 3) {
    warnings.push('Consider adding more sections for better content depth (recommended: 3-7 sections)');
  }

  // Check each section
  outline.sections.forEach((section, idx) => {
    if (!section.heading) {
      errors.push(`Section ${idx + 1}: Heading is required`);
    }
    if (!section.subheadings || section.subheadings.length === 0) {
      warnings.push(`Section ${idx + 1}: Consider adding subheadings for better structure`);
    }
    if (!section.keyPoints || section.keyPoints.length === 0) {
      warnings.push(`Section ${idx + 1}: Add key points for better content guidance`);
    }
  });

  // Check keywords
  if (!outline.targetKeywords || outline.targetKeywords.length === 0) {
    warnings.push('Add target keywords for better SEO optimization');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Estimate reading time from outline
 */
export function estimateReadingTime(outline: BlogOutline): number {
  const totalWords = outline.sections.reduce((sum, s) => sum + (s.estimatedWords || 250), 0);
  return Math.ceil(totalWords / 200); // 200 words per minute average reading speed
}

/**
 * Get outline statistics
 */
export function getOutlineStats(outline: BlogOutline): {
  totalSections: number;
  totalSubheadings: number;
  totalKeyPoints: number;
  estimatedWords: number;
  estimatedReadTime: number;
} {
  return {
    totalSections: outline.sections.length,
    totalSubheadings: outline.sections.reduce((sum, s) => sum + s.subheadings.length, 0),
    totalKeyPoints: outline.sections.reduce((sum, s) => sum + s.keyPoints.length, 0),
    estimatedWords: outline.sections.reduce((sum, s) => sum + (s.estimatedWords || 250), 0),
    estimatedReadTime: estimateReadingTime(outline)
  };
}
