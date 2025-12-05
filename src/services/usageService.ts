// Usage Service - Track and display subscription limits
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://genius-writer.up.railway.app';

export interface UsageStats {
  userId: string;
  plan: 'FREE' | 'PRO' | 'AGENCY' | 'ENTERPRISE';
  limits: {
    aiGenerations: number;
    documentsPerMonth: number;
    storageGB: number;
    exportFormats: string[];
    collaborators: number;
    brands: number;
  };
  usage: {
    aiGenerations: {
      current: number;
      limit: number | string;
      remaining: number | string;
      percentage: number;
    };
    documents: {
      currentMonth: number;
      total: number;
      limit: number | string;
      remaining: number | string;
      percentage: number;
    };
    storage: {
      used: string;
      usedBytes: number;
      limit: string;
      limitBytes: number;
      percentage: number;
    };
  };
  allowedFormats: string[];
  features: {
    collaboration: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    brandVoice: boolean;
  };
}

export interface FeatureCheckResponse {
  feature: string;
  hasAccess: boolean;
  userPlan: string;
  requiredPlans: string[];
  needsUpgrade: boolean;
}

class UsageService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Get comprehensive usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    const response = await fetch(`${API_BASE_URL}/api/usage`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch usage statistics');
    }

    return response.json();
  }

  /**
   * Check if user has access to a specific feature
   */
  async checkFeatureAccess(feature: string): Promise<FeatureCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/api/usage/check/${feature}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check feature access');
    }

    return response.json();
  }

  /**
   * Check if a specific limit has been reached
   */
  async checkLimit(limitType: 'aiGenerations' | 'documents' | 'storage'): Promise<{
    withinLimit: boolean;
    current: number;
    limit: number | string;
    percentage: number;
  }> {
    const stats = await this.getUsageStats();
    const usage = stats.usage[limitType];

    // Handle different property names for different limit types
    let current = 0;
    if (limitType === 'documents') {
      current = usage.currentMonth;
    } else if (limitType === 'aiGenerations') {
      current = usage.current;
    } else if (limitType === 'storage') {
      current = usage.usedBytes;
    }

    return {
      withinLimit: usage.percentage < 100,
      current,
      limit: usage.limit,
      percentage: usage.percentage,
    };
  }

  /**
   * Get user's current plan
   */
  async getCurrentPlan(): Promise<string> {
    const stats = await this.getUsageStats();
    return stats.plan;
  }

  /**
   * Check if user can export to a specific format
   */
  async canExportFormat(format: string): Promise<boolean> {
    const stats = await this.getUsageStats();
    return stats.allowedFormats.includes(format.toUpperCase());
  }

  /**
   * Get plan limits for display
   */
  getPlanLimits(plan: string) {
    const limits = {
      FREE: {
        aiGenerations: 10,
        documentsPerMonth: 5,
        storageGB: 0.1,
        exportFormats: ['PDF'],
        collaborators: 0,
        brands: 1,
      },
      PRO: {
        aiGenerations: 100,
        documentsPerMonth: 50,
        storageGB: 5,
        exportFormats: ['PDF', 'DOCX', 'HTML'],
        collaborators: 0,
        brands: 3,
      },
      AGENCY: {
        aiGenerations: 500,
        documentsPerMonth: 200,
        storageGB: 50,
        exportFormats: ['PDF', 'DOCX', 'HTML', 'MD', 'TXT'],
        collaborators: 5,
        brands: 10,
      },
      ENTERPRISE: {
        aiGenerations: -1,
        documentsPerMonth: -1,
        storageGB: 500,
        exportFormats: ['PDF', 'DOCX', 'HTML', 'MD', 'TXT', 'JSON'],
        collaborators: -1,
        brands: -1,
      },
    };

    return limits[plan as keyof typeof limits] || limits.FREE;
  }

  /**
   * Format limit value for display
   */
  formatLimit(limit: number | string): string {
    if (limit === -1 || limit === 'unlimited') return 'Unlimited';
    return limit.toString();
  }

  /**
   * Get color based on usage percentage
   */
  getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    if (percentage >= 50) return 'yellow';
    return 'green';
  }

  /**
   * Get usage status message
   */
  getUsageStatusMessage(current: number, limit: number | string, type: string): string {
    if (limit === 'unlimited' || limit === -1) {
      return `${current} ${type} used`;
    }

    const remaining = typeof limit === 'number' ? limit - current : 0;
    if (remaining <= 0) {
      return `Limit reached! Upgrade to continue.`;
    }
    if (remaining <= 2) {
      return `Only ${remaining} ${type} remaining this month`;
    }
    return `${current} of ${limit} ${type} used`;
  }
}

// Export singleton instance
export const usageService = new UsageService();
