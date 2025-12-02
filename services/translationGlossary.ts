/**
 * Translation Glossary Service
 *
 * Manages translation glossaries for consistent terminology across translations.
 * Allows users to define specific term translations (e.g., technical terms, brand names)
 * that should remain consistent across all translations.
 */

export interface GlossaryEntry {
  id: string;
  source: string; // Original term
  target: string; // Translated term
  context?: string; // Optional context or notes
  caseSensitive?: boolean;
  createdAt: number;
}

export interface TranslationGlossary {
  id: string;
  name: string;
  description?: string;
  sourceLang: string;
  targetLang: string;
  entries: GlossaryEntry[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'translation_glossaries';

/**
 * Get all glossaries from localStorage
 */
export function getAllGlossaries(): TranslationGlossary[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load glossaries:', error);
    return [];
  }
}

/**
 * Save glossaries to localStorage
 */
function saveGlossaries(glossaries: TranslationGlossary[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(glossaries));
  } catch (error) {
    console.error('Failed to save glossaries:', error);
    throw new Error('Failed to save glossaries');
  }
}

/**
 * Create a new glossary
 */
export function createGlossary(
  name: string,
  sourceLang: string,
  targetLang: string,
  description?: string
): TranslationGlossary {
  const glossaries = getAllGlossaries();

  const newGlossary: TranslationGlossary = {
    id: `glossary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    sourceLang,
    targetLang,
    entries: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  glossaries.push(newGlossary);
  saveGlossaries(glossaries);

  return newGlossary;
}

/**
 * Get a specific glossary by ID
 */
export function getGlossary(id: string): TranslationGlossary | null {
  const glossaries = getAllGlossaries();
  return glossaries.find(g => g.id === id) || null;
}

/**
 * Update a glossary
 */
export function updateGlossary(
  id: string,
  updates: Partial<Omit<TranslationGlossary, 'id' | 'createdAt'>>
): TranslationGlossary | null {
  const glossaries = getAllGlossaries();
  const index = glossaries.findIndex(g => g.id === id);

  if (index === -1) return null;

  glossaries[index] = {
    ...glossaries[index],
    ...updates,
    id: glossaries[index].id,
    createdAt: glossaries[index].createdAt,
    updatedAt: Date.now()
  };

  saveGlossaries(glossaries);
  return glossaries[index];
}

/**
 * Delete a glossary
 */
export function deleteGlossary(id: string): boolean {
  const glossaries = getAllGlossaries();
  const filtered = glossaries.filter(g => g.id !== id);

  if (filtered.length === glossaries.length) return false;

  saveGlossaries(filtered);
  return true;
}

/**
 * Add an entry to a glossary
 */
export function addGlossaryEntry(
  glossaryId: string,
  source: string,
  target: string,
  context?: string,
  caseSensitive: boolean = false
): GlossaryEntry | null {
  const glossary = getGlossary(glossaryId);
  if (!glossary) return null;

  const entry: GlossaryEntry = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    source,
    target,
    context,
    caseSensitive,
    createdAt: Date.now()
  };

  glossary.entries.push(entry);
  updateGlossary(glossaryId, { entries: glossary.entries });

  return entry;
}

/**
 * Update a glossary entry
 */
export function updateGlossaryEntry(
  glossaryId: string,
  entryId: string,
  updates: Partial<Omit<GlossaryEntry, 'id' | 'createdAt'>>
): GlossaryEntry | null {
  const glossary = getGlossary(glossaryId);
  if (!glossary) return null;

  const entryIndex = glossary.entries.findIndex(e => e.id === entryId);
  if (entryIndex === -1) return null;

  glossary.entries[entryIndex] = {
    ...glossary.entries[entryIndex],
    ...updates,
    id: glossary.entries[entryIndex].id,
    createdAt: glossary.entries[entryIndex].createdAt
  };

  updateGlossary(glossaryId, { entries: glossary.entries });
  return glossary.entries[entryIndex];
}

/**
 * Delete a glossary entry
 */
export function deleteGlossaryEntry(glossaryId: string, entryId: string): boolean {
  const glossary = getGlossary(glossaryId);
  if (!glossary) return false;

  const originalLength = glossary.entries.length;
  glossary.entries = glossary.entries.filter(e => e.id !== entryId);

  if (glossary.entries.length === originalLength) return false;

  updateGlossary(glossaryId, { entries: glossary.entries });
  return true;
}

/**
 * Apply glossary to a text (for pre-translation term replacement)
 */
export function applyGlossaryToText(text: string, glossary: TranslationGlossary): string {
  let result = text;

  // Sort entries by length (longest first) to avoid partial replacements
  const sortedEntries = [...glossary.entries].sort((a, b) => b.source.length - a.source.length);

  sortedEntries.forEach(entry => {
    const flags = entry.caseSensitive ? 'g' : 'gi';
    // Use word boundary to match whole words only
    const regex = new RegExp(`\\b${escapeRegex(entry.source)}\\b`, flags);
    result = result.replace(regex, entry.target);
  });

  return result;
}

/**
 * Get glossary context for translation prompt
 */
export function getGlossaryPromptContext(glossary: TranslationGlossary): string {
  if (glossary.entries.length === 0) return '';

  const entriesText = glossary.entries
    .map(e => `  - "${e.source}" → "${e.target}"${e.context ? ` (${e.context})` : ''}`)
    .join('\n');

  return `
TRANSLATION GLOSSARY: Use these exact translations for the following terms:
${entriesText}

These terms must be translated consistently as specified above.
`;
}

/**
 * Find glossaries matching language pair
 */
export function findGlossariesForLanguagePair(
  sourceLang: string,
  targetLang: string
): TranslationGlossary[] {
  const glossaries = getAllGlossaries();
  return glossaries.filter(
    g => g.sourceLang === sourceLang && g.targetLang === targetLang
  );
}

/**
 * Import glossary from CSV
 */
export function importGlossaryFromCSV(
  glossaryId: string,
  csvContent: string
): { success: number; errors: string[] } {
  const glossary = getGlossary(glossaryId);
  if (!glossary) {
    return { success: 0, errors: ['Glossary not found'] };
  }

  const lines = csvContent.split('\n').filter(line => line.trim());
  const errors: string[] = [];
  let success = 0;

  // Skip header if present
  const startIndex = lines[0].toLowerCase().includes('source') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));

    if (parts.length < 2) {
      errors.push(`Line ${i + 1}: Invalid format (need at least source and target)`);
      continue;
    }

    const [source, target, context] = parts;

    if (!source || !target) {
      errors.push(`Line ${i + 1}: Source or target is empty`);
      continue;
    }

    addGlossaryEntry(glossaryId, source, target, context);
    success++;
  }

  return { success, errors };
}

/**
 * Export glossary to CSV
 */
export function exportGlossaryToCSV(glossary: TranslationGlossary): string {
  const header = 'Source,Target,Context\n';
  const rows = glossary.entries.map(e => {
    const source = `"${e.source.replace(/"/g, '""')}"`;
    const target = `"${e.target.replace(/"/g, '""')}"`;
    const context = e.context ? `"${e.context.replace(/"/g, '""')}"` : '';
    return `${source},${target},${context}`;
  }).join('\n');

  return header + rows;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get statistics about a glossary
 */
export function getGlossaryStats(glossary: TranslationGlossary): {
  totalEntries: number;
  caseSensitiveCount: number;
  withContextCount: number;
  averageSourceLength: number;
  averageTargetLength: number;
} {
  const entries = glossary.entries;

  return {
    totalEntries: entries.length,
    caseSensitiveCount: entries.filter(e => e.caseSensitive).length,
    withContextCount: entries.filter(e => e.context).length,
    averageSourceLength: entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.source.length, 0) / entries.length)
      : 0,
    averageTargetLength: entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.target.length, 0) / entries.length)
      : 0
  };
}
