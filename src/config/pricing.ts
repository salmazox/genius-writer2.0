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
    monthly: number; // In EUR
    yearly: number; // In EUR
    yearlyMonthly: number; // Monthly price when billed yearly (EUR)
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

// Currency conversion rate (EUR to USD)
export const EUR_TO_USD_RATE = 1.09; // Update this regularly or fetch from API

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
      monthly: 9.99, // EUR
      yearly: 99.99, // EUR
      yearlyMonthly: 8.33 // EUR
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
      monthly: 24.99, // EUR
      yearly: 249.99, // EUR
      yearlyMonthly: 20.83 // EUR
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
      monthly: 89.99, // EUR
      yearly: 899.99, // EUR
      yearlyMonthly: 74.99 // EUR
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
 * Convert EUR to USD
 */
export function convertEURtoUSD(amountEUR: number): number {
  return Math.round(amountEUR * EUR_TO_USD_RATE * 100) / 100;
}

/**
 * Convert USD to EUR
 */
export function convertUSDtoEUR(amountUSD: number): number {
  return Math.round((amountUSD / EUR_TO_USD_RATE) * 100) / 100;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: 'EUR' | 'USD' = 'EUR'): string {
  return new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format price with currency toggle
 */
export function formatPriceWithCurrency(amountEUR: number, displayCurrency: 'EUR' | 'USD'): string {
  const amount = displayCurrency === 'USD' ? convertEURtoUSD(amountEUR) : amountEUR;
  return formatPrice(amount, displayCurrency);
}

/**
 * Usage limits display text
 */
export function formatLimit(limit: number): string {
  return limit === -1 ? 'Unlimited' : limit.toLocaleString();
}
