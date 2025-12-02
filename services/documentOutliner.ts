/**
 * Document Outliner Service
 *
 * Manages hierarchical document structure, chapters, sections, and outlines.
 * Supports long-form writing with organization tools.
 */

export interface OutlineSection {
  id: string;
  title: string;
  content: string;
  level: number; // 1 = Chapter, 2 = Section, 3 = Subsection
  order: number;
  parentId?: string;
  wordCount: number;
  wordCountGoal?: number;
  notes?: string;
  status: 'planning' | 'in-progress' | 'complete';
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentOutline {
  id: string;
  documentId: string;
  sections: OutlineSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  sections: OutlineSection[];
  wordCount: number;
  wordCountGoal?: number;
  order: number;
  status: 'planning' | 'in-progress' | 'complete';
}

export interface Heading {
  id: string;
  text: string;
  level: number; // 1-6 for h1-h6
  position: number; // Character position in document
}

const OUTLINE_STORAGE_KEY = 'genius_document_outlines';

/**
 * Generate a unique ID for sections
 */
function generateId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, ' ');
  // Split by whitespace and filter empty strings
  return plainText.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Get outline for a document
 */
export function getOutline(documentId: string): DocumentOutline | null {
  const outlinesJson = localStorage.getItem(OUTLINE_STORAGE_KEY);
  if (!outlinesJson) return null;

  const outlines: DocumentOutline[] = JSON.parse(outlinesJson);
  const outline = outlines.find(o => o.documentId === documentId);

  if (!outline) return null;

  return {
    ...outline,
    createdAt: new Date(outline.createdAt),
    updatedAt: new Date(outline.updatedAt),
    sections: outline.sections.map(s => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }))
  };
}

/**
 * Create a new outline for a document
 */
export function createOutline(documentId: string): DocumentOutline {
  const outlinesJson = localStorage.getItem(OUTLINE_STORAGE_KEY);
  const outlines: DocumentOutline[] = outlinesJson ? JSON.parse(outlinesJson) : [];

  const newOutline: DocumentOutline = {
    id: `outline_${Date.now()}`,
    documentId,
    sections: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  outlines.push(newOutline);
  localStorage.setItem(OUTLINE_STORAGE_KEY, JSON.stringify(outlines));

  return newOutline;
}

/**
 * Add a section to the outline
 */
export function addSection(
  documentId: string,
  title: string,
  level: number,
  parentId?: string,
  options?: {
    content?: string;
    wordCountGoal?: number;
    notes?: string;
  }
): OutlineSection {
  let outline = getOutline(documentId);
  if (!outline) {
    outline = createOutline(documentId);
  }

  // Calculate order
  const siblingSections = parentId
    ? outline.sections.filter(s => s.parentId === parentId)
    : outline.sections.filter(s => !s.parentId && s.level === level);
  const order = siblingSections.length;

  const newSection: OutlineSection = {
    id: generateId(),
    title,
    content: options?.content || '',
    level,
    order,
    parentId,
    wordCount: countWords(options?.content || ''),
    wordCountGoal: options?.wordCountGoal,
    notes: options?.notes,
    status: 'planning',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  outline.sections.push(newSection);
  outline.updatedAt = new Date();

  saveOutline(outline);
  return newSection;
}

/**
 * Update a section
 */
export function updateSection(
  documentId: string,
  sectionId: string,
  updates: Partial<OutlineSection>
): OutlineSection | null {
  const outline = getOutline(documentId);
  if (!outline) return null;

  const section = outline.sections.find(s => s.id === sectionId);
  if (!section) return null;

  // Update section
  Object.assign(section, updates);
  section.updatedAt = new Date();

  // Recalculate word count if content changed
  if (updates.content !== undefined) {
    section.wordCount = countWords(section.content);
  }

  outline.updatedAt = new Date();
  saveOutline(outline);

  return section;
}

/**
 * Delete a section (and all its children)
 */
export function deleteSection(documentId: string, sectionId: string): boolean {
  const outline = getOutline(documentId);
  if (!outline) return false;

  // Find all child sections recursively
  const findChildren = (parentId: string): string[] => {
    const children = outline.sections.filter(s => s.parentId === parentId);
    const childIds = children.map(c => c.id);
    const grandchildIds = children.flatMap(c => findChildren(c.id));
    return [...childIds, ...grandchildIds];
  };

  const idsToDelete = [sectionId, ...findChildren(sectionId)];

  // Remove sections
  outline.sections = outline.sections.filter(s => !idsToDelete.includes(s.id));
  outline.updatedAt = new Date();

  saveOutline(outline);
  return true;
}

/**
 * Reorder sections
 */
export function reorderSections(
  documentId: string,
  sectionId: string,
  newOrder: number
): boolean {
  const outline = getOutline(documentId);
  if (!outline) return false;

  const section = outline.sections.find(s => s.id === sectionId);
  if (!section) return false;

  const oldOrder = section.order;

  // Get sibling sections (same parent and level)
  const siblings = outline.sections.filter(
    s => s.parentId === section.parentId && s.level === section.level && s.id !== sectionId
  );

  // Update orders
  if (newOrder > oldOrder) {
    // Moving down
    siblings.forEach(s => {
      if (s.order > oldOrder && s.order <= newOrder) {
        s.order--;
      }
    });
  } else {
    // Moving up
    siblings.forEach(s => {
      if (s.order >= newOrder && s.order < oldOrder) {
        s.order++;
      }
    });
  }

  section.order = newOrder;
  outline.updatedAt = new Date();

  saveOutline(outline);
  return true;
}

/**
 * Get chapters (level 1 sections) with their subsections
 */
export function getChapters(documentId: string): Chapter[] {
  const outline = getOutline(documentId);
  if (!outline) return [];

  const chapters = outline.sections
    .filter(s => s.level === 1)
    .sort((a, b) => a.order - b.order)
    .map(chapter => {
      const subsections = outline.sections
        .filter(s => s.parentId === chapter.id)
        .sort((a, b) => a.order - b.order);

      const totalWordCount = chapter.wordCount + subsections.reduce((sum, s) => sum + s.wordCount, 0);
      const totalGoal = (chapter.wordCountGoal || 0) + subsections.reduce((sum, s) => sum + (s.wordCountGoal || 0), 0);

      return {
        id: chapter.id,
        title: chapter.title,
        description: chapter.notes,
        sections: subsections,
        wordCount: totalWordCount,
        wordCountGoal: totalGoal > 0 ? totalGoal : undefined,
        order: chapter.order,
        status: chapter.status
      };
    });

  return chapters;
}

/**
 * Extract headings from HTML content
 */
export function extractHeadings(htmlContent: string): Heading[] {
  const headings: Heading[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headingElements.forEach((element, index) => {
    const level = parseInt(element.tagName.substring(1));
    const text = element.textContent || '';

    headings.push({
      id: `heading_${index}`,
      text,
      level,
      position: index
    });
  });

  return headings;
}

/**
 * Generate outline from existing content
 */
export function generateOutlineFromContent(
  documentId: string,
  htmlContent: string
): DocumentOutline {
  const headings = extractHeadings(htmlContent);
  let outline = getOutline(documentId);

  if (!outline) {
    outline = createOutline(documentId);
  }

  // Clear existing sections
  outline.sections = [];

  // Convert headings to sections
  const sectionStack: { section: OutlineSection; level: number }[] = [];

  headings.forEach((heading, index) => {
    // Find parent section
    let parentId: string | undefined;

    // Pop stack until we find a section with level less than current
    while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= heading.level) {
      sectionStack.pop();
    }

    if (sectionStack.length > 0) {
      parentId = sectionStack[sectionStack.length - 1].section.id;
    }

    const newSection: OutlineSection = {
      id: generateId(),
      title: heading.text,
      content: '',
      level: heading.level,
      order: index,
      parentId,
      wordCount: 0,
      status: 'in-progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    outline!.sections.push(newSection);
    sectionStack.push({ section: newSection, level: heading.level });
  });

  outline.updatedAt = new Date();
  saveOutline(outline);

  return outline;
}

/**
 * Generate table of contents from outline
 */
export function generateTableOfContents(documentId: string): string {
  const outline = getOutline(documentId);
  if (!outline || outline.sections.length === 0) return '';

  const sortedSections = [...outline.sections].sort((a, b) => a.order - b.order);

  let toc = '<div class="table-of-contents">\n';
  toc += '<h2>Table of Contents</h2>\n';
  toc += '<nav>\n';

  const buildTocList = (parentId?: string, level: number = 1): string => {
    const sections = sortedSections.filter(s =>
      parentId ? s.parentId === parentId : !s.parentId
    );

    if (sections.length === 0) return '';

    let html = '<ol>\n';

    sections.forEach(section => {
      const indent = '  '.repeat(level);
      html += `${indent}<li>\n`;
      html += `${indent}  <a href="#${section.id}">${section.title}</a>\n`;

      // Recursively add children
      const children = buildTocList(section.id, level + 1);
      if (children) {
        html += children;
      }

      html += `${indent}</li>\n`;
    });

    html += '</ol>\n';
    return html;
  };

  toc += buildTocList();
  toc += '</nav>\n';
  toc += '</div>\n';

  return toc;
}

/**
 * Calculate overall progress
 */
export function calculateProgress(documentId: string): {
  totalSections: number;
  completedSections: number;
  totalWords: number;
  targetWords: number;
  progressPercentage: number;
} {
  const outline = getOutline(documentId);

  if (!outline || outline.sections.length === 0) {
    return {
      totalSections: 0,
      completedSections: 0,
      totalWords: 0,
      targetWords: 0,
      progressPercentage: 0
    };
  }

  const totalSections = outline.sections.length;
  const completedSections = outline.sections.filter(s => s.status === 'complete').length;
  const totalWords = outline.sections.reduce((sum, s) => sum + s.wordCount, 0);
  const targetWords = outline.sections.reduce((sum, s) => sum + (s.wordCountGoal || 0), 0);

  const progressPercentage = targetWords > 0
    ? Math.round((totalWords / targetWords) * 100)
    : completedSections > 0
      ? Math.round((completedSections / totalSections) * 100)
      : 0;

  return {
    totalSections,
    completedSections,
    totalWords,
    targetWords,
    progressPercentage
  };
}

/**
 * Save outline to localStorage
 */
function saveOutline(outline: DocumentOutline): void {
  const outlinesJson = localStorage.getItem(OUTLINE_STORAGE_KEY);
  let outlines: DocumentOutline[] = outlinesJson ? JSON.parse(outlinesJson) : [];

  // Replace existing outline
  outlines = outlines.filter(o => o.documentId !== outline.documentId);
  outlines.push(outline);

  localStorage.setItem(OUTLINE_STORAGE_KEY, JSON.stringify(outlines));
}

export default {
  getOutline,
  createOutline,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  getChapters,
  extractHeadings,
  generateOutlineFromContent,
  generateTableOfContents,
  calculateProgress
};
