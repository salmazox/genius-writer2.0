/**
 * Pricing and Subscription Plans Configuration
 *
 * Defines all subscription tiers, features, and pricing details
 */

export enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  price: {
    monthly: number;
    yearly: number;
    yearlyMonthly: number; // Monthly price when billed yearly
  };
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
  limits: {
    aiGenerations: number; // -1 = unlimited
    documentsPerMonth: number;
    storageGB: number;
    exportFormats: string[];
    collaborators: number;
    brands: number; // Brand voice profiles
  };
  features: {
    name: string;
    included: boolean;
    limit?: string;
  }[];
  popular?: boolean;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  [SubscriptionTier.FREE]: {
    id: SubscriptionTier.FREE,
    name: 'Free',
    tagline: 'Perfect for trying out Genius Writer',
    price: {
      monthly: 0,
      yearly: 0,
      yearlyMonthly: 0
    },
    stripePriceId: {
      monthly: '',
      yearly: ''
    },
    limits: {
      aiGenerations: 10,
      documentsPerMonth: 5,
      storageGB: 0.1,
      exportFormats: ['PDF'],
      collaborators: 0,
      brands: 1
    },
    features: [
      { name: '10 AI generations per month', included: true },
      { name: '5 documents per month', included: true },
      { name: 'Basic templates', included: true },
      { name: 'PDF export', included: true },
      { name: 'Email support', included: false },
      { name: 'Collaboration', included: false },
      { name: 'Brand voice profiles', included: false },
      { name: 'Priority support', included: false }
    ]
  },

  [SubscriptionTier.STARTER]: {
    id: SubscriptionTier.STARTER,
    name: 'Starter',
    tagline: 'For individuals and freelancers',
    price: {
      monthly: 12,
      yearly: 120,
      yearlyMonthly: 10
    },
    stripePriceId: {
      monthly: 'price_starter_monthly', // Replace with actual Stripe price IDs
      yearly: 'price_starter_yearly'
    },
    limits: {
      aiGenerations: 100,
      documentsPerMonth: 50,
      storageGB: 5,
      exportFormats: ['PDF', 'DOCX', 'HTML'],
      collaborators: 0,
      brands: 3
    },
    features: [
      { name: '100 AI generations per month', included: true },
      { name: '50 documents per month', included: true },
      { name: 'All templates', included: true },
      { name: 'Multiple export formats', included: true, limit: 'PDF, DOCX, HTML' },
      { name: '5GB storage', included: true },
      { name: '3 brand voice profiles', included: true },
      { name: 'Email support', included: true },
      { name: 'Collaboration', included: false }
    ],
    popular: true,
    badge: 'Most Popular'
  },

  [SubscriptionTier.PROFESSIONAL]: {
    id: SubscriptionTier.PROFESSIONAL,
    name: 'Professional',
    tagline: 'For teams and growing businesses',
    price: {
      monthly: 29,
      yearly: 290,
      yearlyMonthly: 24
    },
    stripePriceId: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly'
    },
    limits: {
      aiGenerations: 500,
      documentsPerMonth: 200,
      storageGB: 50,
      exportFormats: ['PDF', 'DOCX', 'HTML', 'MD', 'TXT'],
      collaborators: 5,
      brands: 10
    },
    features: [
      { name: '500 AI generations per month', included: true },
      { name: '200 documents per month', included: true },
      { name: 'All premium templates', included: true },
      { name: 'All export formats', included: true },
      { name: '50GB storage', included: true },
      { name: '10 brand voice profiles', included: true },
      { name: 'Team collaboration', included: true, limit: '5 members' },
      { name: 'Priority email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'API access', included: false }
    ]
  },

  [SubscriptionTier.ENTERPRISE]: {
    id: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    tagline: 'For large organizations',
    price: {
      monthly: 99,
      yearly: 990,
      yearlyMonthly: 82
    },
    stripePriceId: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly'
    },
    limits: {
      aiGenerations: -1,
      documentsPerMonth: -1,
      storageGB: 500,
      exportFormats: ['PDF', 'DOCX', 'HTML', 'MD', 'TXT', 'JSON'],
      collaborators: -1,
      brands: -1
    },
    features: [
      { name: 'Unlimited AI generations', included: true },
      { name: 'Unlimited documents', included: true },
      { name: 'All premium templates', included: true },
      { name: 'All export formats', included: true },
      { name: '500GB storage', included: true },
      { name: 'Unlimited brand voice profiles', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'API access', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom contract', included: true }
    ],
    badge: 'Best Value'
  }
};

/**
 * Get plan by tier
 */
export function getPlan(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier];
}

/**
 * Get all plans as array
 */
export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Check if a feature is available in a plan
 */
export function hasFeature(tier: SubscriptionTier, featureName: string): boolean {
  const plan = getPlan(tier);
  const feature = plan.features.find(f => f.name.toLowerCase().includes(featureName.toLowerCase()));
  return feature?.included || false;
}

/**
 * Check if user has reached limit
 */
export function isWithinLimit(tier: SubscriptionTier, limitType: keyof SubscriptionPlan['limits'], currentUsage: number): boolean {
  const plan = getPlan(tier);
  const limit = plan.limits[limitType];

  if (typeof limit === 'number') {
    return limit === -1 || currentUsage < limit;
  }

  return true;
}

/**
 * Calculate savings for yearly plan
 */
export function calculateYearlySavings(tier: SubscriptionTier): number {
  const plan = getPlan(tier);
  const monthlyTotal = plan.price.monthly * 12;
  const yearlyTotal = plan.price.yearly;
  return monthlyTotal - yearlyTotal;
}

/**
 * Get savings percentage
 */
export function getSavingsPercentage(tier: SubscriptionTier): number {
  const plan = getPlan(tier);
  if (plan.price.monthly === 0) return 0;

  const monthlyTotal = plan.price.monthly * 12;
  const yearlyTotal = plan.price.yearly;
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Usage limits display text
 */
export function formatLimit(limit: number): string {
  return limit === -1 ? 'Unlimited' : limit.toLocaleString();
}
