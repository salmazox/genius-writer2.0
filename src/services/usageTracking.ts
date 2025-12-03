/**
 * Usage Tracking Service
 *
 * Tracks user usage across different features and enforces limits
 * based on subscription tier
 */

import { SubscriptionTier, getPlan, isWithinLimit } from '../config/pricing';

export interface UsageRecord {
  userId: string;
  month: string; // Format: YYYY-MM
  aiGenerations: number;
  documentsCreated: number;
  storageUsedMB: number;
  exportsCount: number;
  collaborationsCount: number;
  lastUpdated: number;
}

export interface UsageMetrics {
  current: UsageRecord;
  limits: {
    aiGenerations: number;
    documents: number;
    storageGB: number;
  };
  percentages: {
    aiGenerations: number;
    documents: number;
    storage: number;
  };
  daysUntilReset: number;
}

const STORAGE_KEY = 'genius_writer_usage';

/**
 * Get current month key
 */
function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get usage for current month
 */
export function getCurrentUsage(userId: string): UsageRecord {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!stored) {
      return createEmptyUsage(userId);
    }

    const usage: UsageRecord = JSON.parse(stored);
    const currentMonth = getCurrentMonthKey();

    // Reset if new month
    if (usage.month !== currentMonth) {
      return createEmptyUsage(userId);
    }

    return usage;
  } catch {
    return createEmptyUsage(userId);
  }
}

/**
 * Create empty usage record
 */
function createEmptyUsage(userId: string): UsageRecord {
  return {
    userId,
    month: getCurrentMonthKey(),
    aiGenerations: 0,
    documentsCreated: 0,
    storageUsedMB: 0,
    exportsCount: 0,
    collaborationsCount: 0,
    lastUpdated: Date.now()
  };
}

/**
 * Save usage record
 */
function saveUsage(usage: UsageRecord): void {
  try {
    usage.lastUpdated = Date.now();
    localStorage.setItem(`${STORAGE_KEY}_${usage.userId}`, JSON.stringify(usage));
  } catch (error) {
    console.error('Failed to save usage:', error);
  }
}

/**
 * Track AI generation
 */
export function trackAIGeneration(userId: string, tier: SubscriptionTier): boolean {
  const usage = getCurrentUsage(userId);
  const plan = getPlan(tier);

  // Check if within limit
  if (!isWithinLimit(tier, 'aiGenerations', usage.aiGenerations)) {
    return false;
  }

  usage.aiGenerations++;
  saveUsage(usage);
  return true;
}

/**
 * Track document creation
 */
export function trackDocumentCreation(userId: string, tier: SubscriptionTier, sizeKB: number = 0): boolean {
  const usage = getCurrentUsage(userId);
  const plan = getPlan(tier);

  // Check document limit
  if (!isWithinLimit(tier, 'documentsPerMonth', usage.documentsCreated)) {
    return false;
  }

  // Check storage limit
  const newStorageMB = usage.storageUsedMB + (sizeKB / 1024);
  const storageLimitMB = plan.limits.storageGB * 1024;

  if (storageLimitMB !== -1 && newStorageMB > storageLimitMB) {
    return false;
  }

  usage.documentsCreated++;
  usage.storageUsedMB = newStorageMB;
  saveUsage(usage);
  return true;
}

/**
 * Track export
 */
export function trackExport(userId: string, format: string, tier: SubscriptionTier): boolean {
  const plan = getPlan(tier);

  // Check if format is allowed
  if (!plan.limits.exportFormats.includes(format.toUpperCase())) {
    return false;
  }

  const usage = getCurrentUsage(userId);
  usage.exportsCount++;
  saveUsage(usage);
  return true;
}

/**
 * Track collaboration
 */
export function trackCollaboration(userId: string, tier: SubscriptionTier): boolean {
  const plan = getPlan(tier);

  if (plan.limits.collaborators === 0) {
    return false;
  }

  const usage = getCurrentUsage(userId);
  usage.collaborationsCount++;
  saveUsage(usage);
  return true;
}

/**
 * Get usage metrics with limits and percentages
 */
export function getUsageMetrics(userId: string, tier: SubscriptionTier): UsageMetrics {
  const usage = getCurrentUsage(userId);
  const plan = getPlan(tier);

  // Calculate percentages
  const aiPercentage = plan.limits.aiGenerations === -1
    ? 0
    : Math.round((usage.aiGenerations / plan.limits.aiGenerations) * 100);

  const documentsPercentage = plan.limits.documentsPerMonth === -1
    ? 0
    : Math.round((usage.documentsCreated / plan.limits.documentsPerMonth) * 100);

  const storagePercentage = plan.limits.storageGB === -1
    ? 0
    : Math.round((usage.storageUsedMB / (plan.limits.storageGB * 1024)) * 100);

  // Calculate days until reset
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    current: usage,
    limits: {
      aiGenerations: plan.limits.aiGenerations,
      documents: plan.limits.documentsPerMonth,
      storageGB: plan.limits.storageGB
    },
    percentages: {
      aiGenerations: Math.min(100, aiPercentage),
      documents: Math.min(100, documentsPercentage),
      storage: Math.min(100, storagePercentage)
    },
    daysUntilReset
  };
}

/**
 * Check if user can perform action
 */
export function canPerformAction(
  userId: string,
  tier: SubscriptionTier,
  action: 'generate' | 'create' | 'export' | 'collaborate'
): { allowed: boolean; reason?: string } {
  const usage = getCurrentUsage(userId);
  const plan = getPlan(tier);

  switch (action) {
    case 'generate':
      if (!isWithinLimit(tier, 'aiGenerations', usage.aiGenerations)) {
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${plan.limits.aiGenerations} AI generations. Upgrade to generate more.`
        };
      }
      break;

    case 'create':
      if (!isWithinLimit(tier, 'documentsPerMonth', usage.documentsCreated)) {
        return {
          allowed: false,
          reason: `You've reached your monthly limit of ${plan.limits.documentsPerMonth} documents. Upgrade for more.`
        };
      }

      const storageLimitMB = plan.limits.storageGB * 1024;
      if (storageLimitMB !== -1 && usage.storageUsedMB >= storageLimitMB) {
        return {
          allowed: false,
          reason: `You've reached your storage limit of ${plan.limits.storageGB}GB. Upgrade for more storage.`
        };
      }
      break;

    case 'collaborate':
      if (plan.limits.collaborators === 0) {
        return {
          allowed: false,
          reason: 'Collaboration is not available in your plan. Upgrade to Professional or Enterprise.'
        };
      }
      break;

    case 'export':
      // Export format checking is done in trackExport
      break;
  }

  return { allowed: true };
}

/**
 * Get usage history for analytics
 */
export function getUsageHistory(userId: string, monthsBack: number = 6): UsageRecord[] {
  const history: UsageRecord[] = [];
  const now = new Date();

  for (let i = 0; i < monthsBack; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}_${monthKey}`);
      if (stored) {
        history.push(JSON.parse(stored));
      }
    } catch {
      // Skip invalid entries
    }
  }

  return history.reverse(); // Chronological order
}

/**
 * Archive current month's usage (call at month end)
 */
export function archiveCurrentMonth(userId: string): void {
  const usage = getCurrentUsage(userId);
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}_${usage.month}`, JSON.stringify(usage));
  } catch (error) {
    console.error('Failed to archive usage:', error);
  }
}

/**
 * Reset usage (for testing or admin purposes)
 */
export function resetUsage(userId: string): void {
  const emptyUsage = createEmptyUsage(userId);
  saveUsage(emptyUsage);
}

/**
 * Get summary statistics
 */
export function getUsageSummary(userId: string, tier: SubscriptionTier): {
  totalAIGenerations: number;
  totalDocuments: number;
  averagePerMonth: {
    aiGenerations: number;
    documents: number;
  };
  mostActiveMonth: string;
} {
  const history = getUsageHistory(userId, 12);

  if (history.length === 0) {
    return {
      totalAIGenerations: 0,
      totalDocuments: 0,
      averagePerMonth: { aiGenerations: 0, documents: 0 },
      mostActiveMonth: getCurrentMonthKey()
    };
  }

  const totalAI = history.reduce((sum, h) => sum + h.aiGenerations, 0);
  const totalDocs = history.reduce((sum, h) => sum + h.documentsCreated, 0);

  const mostActive = history.reduce((max, h) =>
    (h.aiGenerations + h.documentsCreated) > (max.aiGenerations + max.documentsCreated) ? h : max
  );

  return {
    totalAIGenerations: totalAI,
    totalDocuments: totalDocs,
    averagePerMonth: {
      aiGenerations: Math.round(totalAI / history.length),
      documents: Math.round(totalDocs / history.length)
    },
    mostActiveMonth: mostActive.month
  };
}

export default {
  getCurrentUsage,
  trackAIGeneration,
  trackDocumentCreation,
  trackExport,
  trackCollaboration,
  getUsageMetrics,
  canPerformAction,
  getUsageHistory,
  getUsageSummary,
  resetUsage
};
