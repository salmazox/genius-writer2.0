/**
 * CV Version History Service
 *
 * Tracks CV versions over time with ATS scores and metadata
 * Enables comparison, rollback, and improvement tracking
 */

import { CVData } from '../types';
import { ATSScoreBreakdown } from './atsScoring';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CVVersion {
  id: string;
  timestamp: number;
  cvData: CVData;
  atsScore: ATSScoreBreakdown | null;
  metadata: {
    name: string; // User-defined name or auto-generated
    tags: string[]; // e.g., ['before-optimization', 'job-xyz']
    notes?: string;
  };
  metrics?: {
    applicationsSubmitted?: number;
    interviewsReceived?: number;
    offersReceived?: number;
  };
}

export interface VersionStats {
  totalVersions: number;
  averageScore: number;
  scoreImprovement: number; // Percentage improvement from first to latest
  scoreHistory: Array<{ timestamp: number; score: number }>;
  bestVersion: CVVersion | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'cv_version_history';
const MAX_VERSIONS = 50; // Limit to prevent localStorage overflow

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const getVersionHistory = (): CVVersion[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const versions: CVVersion[] = JSON.parse(stored);

    // Sort by timestamp descending (newest first)
    return versions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load version history:', error);
    return [];
  }
};

const saveVersionHistory = (versions: CVVersion[]): void => {
  try {
    // Keep only MAX_VERSIONS most recent
    const limited = versions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_VERSIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to save version history:', error);
    // If localStorage is full, remove oldest versions and retry
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const reduced = versions.slice(0, Math.floor(MAX_VERSIONS / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
    }
  }
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Save a new CV version
 */
export const saveVersion = (
  cvData: CVData,
  atsScore: ATSScoreBreakdown | null,
  name?: string,
  tags?: string[]
): CVVersion => {
  const versions = getVersionHistory();

  const newVersion: CVVersion = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    cvData: JSON.parse(JSON.stringify(cvData)), // Deep clone
    atsScore: atsScore ? JSON.parse(JSON.stringify(atsScore)) : null,
    metadata: {
      name: name || `Version ${versions.length + 1}`,
      tags: tags || [],
    },
  };

  versions.unshift(newVersion); // Add to beginning (newest first)
  saveVersionHistory(versions);

  return newVersion;
};

/**
 * Get all versions
 */
export const getAllVersions = (): CVVersion[] => {
  return getVersionHistory();
};

/**
 * Get a specific version by ID
 */
export const getVersion = (versionId: string): CVVersion | null => {
  const versions = getVersionHistory();
  return versions.find(v => v.id === versionId) || null;
};

/**
 * Update version metadata (name, tags, notes)
 */
export const updateVersionMetadata = (
  versionId: string,
  updates: Partial<CVVersion['metadata']>
): void => {
  const versions = getVersionHistory();
  const versionIndex = versions.findIndex(v => v.id === versionId);

  if (versionIndex !== -1) {
    versions[versionIndex].metadata = {
      ...versions[versionIndex].metadata,
      ...updates,
    };
    saveVersionHistory(versions);
  }
};

/**
 * Update version metrics (applications, interviews, offers)
 */
export const updateVersionMetrics = (
  versionId: string,
  metrics: Partial<CVVersion['metrics']>
): void => {
  const versions = getVersionHistory();
  const versionIndex = versions.findIndex(v => v.id === versionId);

  if (versionIndex !== -1) {
    versions[versionIndex].metrics = {
      ...versions[versionIndex].metrics,
      ...metrics,
    };
    saveVersionHistory(versions);
  }
};

/**
 * Delete a version
 */
export const deleteVersion = (versionId: string): void => {
  const versions = getVersionHistory();
  const filtered = versions.filter(v => v.id !== versionId);
  saveVersionHistory(filtered);
};

/**
 * Clear all version history
 */
export const clearAllVersions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get version statistics
 */
export const getVersionStats = (): VersionStats => {
  const versions = getVersionHistory();

  if (versions.length === 0) {
    return {
      totalVersions: 0,
      averageScore: 0,
      scoreImprovement: 0,
      scoreHistory: [],
      bestVersion: null,
    };
  }

  // Calculate scores
  const versionsWithScores = versions.filter(v => v.atsScore !== null);
  const scores = versionsWithScores.map(v => v.atsScore!.overall);

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  // Calculate improvement (first version to latest)
  const firstScore = versionsWithScores[versionsWithScores.length - 1]?.atsScore?.overall || 0;
  const latestScore = versionsWithScores[0]?.atsScore?.overall || 0;
  const scoreImprovement = firstScore > 0
    ? Math.round(((latestScore - firstScore) / firstScore) * 100)
    : 0;

  // Build score history for chart
  const scoreHistory = versionsWithScores
    .map(v => ({
      timestamp: v.timestamp,
      score: v.atsScore!.overall,
    }))
    .reverse(); // Chronological order for chart

  // Find best version (highest score)
  const bestVersion = versionsWithScores.length > 0
    ? versionsWithScores.reduce((best, current) =>
        (current.atsScore!.overall > (best.atsScore?.overall || 0)) ? current : best
      )
    : null;

  return {
    totalVersions: versions.length,
    averageScore,
    scoreImprovement,
    scoreHistory,
    bestVersion,
  };
};

/**
 * Compare two versions
 */
export const compareVersions = (
  versionId1: string,
  versionId2: string
): {
  version1: CVVersion;
  version2: CVVersion;
  scoreDiff: number;
  improvements: string[];
  regressions: string[];
} | null => {
  const v1 = getVersion(versionId1);
  const v2 = getVersion(versionId2);

  if (!v1 || !v2) return null;

  const scoreDiff = (v2.atsScore?.overall || 0) - (v1.atsScore?.overall || 0);

  const improvements: string[] = [];
  const regressions: string[] = [];

  if (v1.atsScore && v2.atsScore) {
    // Compare each criterion
    Object.keys(v1.atsScore.criteria).forEach((key) => {
      const criterion = key as keyof typeof v1.atsScore.criteria;
      const diff = v2.atsScore!.criteria[criterion].score - v1.atsScore!.criteria[criterion].score;

      if (diff > 5) {
        improvements.push(`${criterion}: +${diff} points`);
      } else if (diff < -5) {
        regressions.push(`${criterion}: ${diff} points`);
      }
    });
  }

  return {
    version1: v1,
    version2: v2,
    scoreDiff,
    improvements,
    regressions,
  };
};

/**
 * Auto-save current CV as checkpoint (throttled to prevent spam)
 */
let lastAutoSaveTime = 0;
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const autoSaveCheckpoint = (
  cvData: CVData,
  atsScore: ATSScoreBreakdown | null
): void => {
  const now = Date.now();

  if (now - lastAutoSaveTime > AUTO_SAVE_INTERVAL) {
    saveVersion(cvData, atsScore, `Auto-checkpoint ${new Date().toLocaleString()}`, ['auto-save']);
    lastAutoSaveTime = now;
  }
};

/**
 * Export version history as JSON
 */
export const exportVersionHistory = (): string => {
  const versions = getVersionHistory();
  return JSON.stringify(versions, null, 2);
};

/**
 * Import version history from JSON
 */
export const importVersionHistory = (jsonString: string): boolean => {
  try {
    const imported: CVVersion[] = JSON.parse(jsonString);

    // Validate structure
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array');
    }

    // Merge with existing versions (avoid duplicates by ID)
    const existing = getVersionHistory();
    const existingIds = new Set(existing.map(v => v.id));

    const newVersions = imported.filter(v => !existingIds.has(v.id));
    const merged = [...existing, ...newVersions];

    saveVersionHistory(merged);
    return true;
  } catch (error) {
    console.error('Failed to import version history:', error);
    return false;
  }
};
