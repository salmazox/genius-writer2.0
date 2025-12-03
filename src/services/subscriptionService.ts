/**
 * Subscription Service
 *
 * Manages user subscriptions, payments, and billing
 * In production, this would integrate with Stripe backend
 */

import { SubscriptionTier, getPlan } from '../config/pricing';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd?: number;
  paymentMethod?: PaymentMethod;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: number;
  pdfUrl?: string;
  description: string;
}

const STORAGE_KEY = 'genius_writer_subscription';
const INVOICES_KEY = 'genius_writer_invoices';

/**
 * Get user's current subscription
 */
export function getSubscription(userId: string): Subscription | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!stored) return null;

    const subscription: Subscription = JSON.parse(stored);

    // Check if subscription is expired
    if (subscription.currentPeriodEnd < Date.now() && subscription.status === 'active') {
      subscription.status = 'past_due';
      saveSubscription(subscription);
    }

    return subscription;
  } catch {
    return null;
  }
}

/**
 * Save subscription
 */
function saveSubscription(subscription: Subscription): void {
  try {
    subscription.updatedAt = Date.now();
    localStorage.setItem(`${STORAGE_KEY}_${subscription.userId}`, JSON.stringify(subscription));
  } catch (error) {
    console.error('Failed to save subscription:', error);
  }
}

/**
 * Create or update subscription
 * In production, this would call Stripe API
 */
export function createSubscription(
  userId: string,
  tier: SubscriptionTier,
  billingCycle: 'monthly' | 'yearly',
  paymentMethod: PaymentMethod,
  trialDays: number = 0
): Subscription {
  const plan = getPlan(tier);
  const now = Date.now();

  // Calculate period dates
  const periodLength = billingCycle === 'monthly' ? 30 : 365;
  const trialEnd = trialDays > 0 ? now + (trialDays * 24 * 60 * 60 * 1000) : undefined;
  const periodStart = trialEnd || now;
  const periodEnd = periodStart + (periodLength * 24 * 60 * 60 * 1000);

  const subscription: Subscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    tier,
    status: trialDays > 0 ? 'trialing' : 'active',
    billingCycle,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    trialEnd,
    paymentMethod,
    createdAt: now,
    updatedAt: now
  };

  saveSubscription(subscription);

  // Create first invoice (or trial invoice)
  if (trialDays === 0) {
    createInvoice(subscription);
  }

  return subscription;
}

/**
 * Update subscription tier
 */
export function updateSubscriptionTier(
  userId: string,
  newTier: SubscriptionTier
): Subscription | null {
  const subscription = getSubscription(userId);
  if (!subscription) return null;

  subscription.tier = newTier;
  subscription.updatedAt = Date.now();

  // Prorate and create invoice for the change
  const prorationAmount = calculateProration(subscription, newTier);
  if (prorationAmount !== 0) {
    createProrationInvoice(subscription, prorationAmount);
  }

  saveSubscription(subscription);
  return subscription;
}

/**
 * Calculate proration for plan change
 */
function calculateProration(subscription: Subscription, newTier: SubscriptionTier): number {
  const oldPlan = getPlan(subscription.tier);
  const newPlan = getPlan(newTier);

  const oldPrice = subscription.billingCycle === 'monthly' ? oldPlan.price.monthly : oldPlan.price.yearly;
  const newPrice = subscription.billingCycle === 'monthly' ? newPlan.price.monthly : newPlan.price.yearly;

  const periodTotal = subscription.currentPeriodEnd - subscription.currentPeriodStart;
  const timeRemaining = subscription.currentPeriodEnd - Date.now();
  const percentageRemaining = timeRemaining / periodTotal;

  const unusedCredit = oldPrice * percentageRemaining;
  const newCharge = newPrice * percentageRemaining;

  return newCharge - unusedCredit;
}

/**
 * Cancel subscription
 */
export function cancelSubscription(userId: string, immediately: boolean = false): Subscription | null {
  const subscription = getSubscription(userId);
  if (!subscription) return null;

  if (immediately) {
    subscription.status = 'canceled';
    subscription.currentPeriodEnd = Date.now();
  } else {
    subscription.cancelAtPeriodEnd = true;
  }

  saveSubscription(subscription);
  return subscription;
}

/**
 * Reactivate canceled subscription
 */
export function reactivateSubscription(userId: string): Subscription | null {
  const subscription = getSubscription(userId);
  if (!subscription) return null;

  subscription.cancelAtPeriodEnd = false;
  subscription.status = 'active';
  saveSubscription(subscription);

  return subscription;
}

/**
 * Update payment method
 */
export function updatePaymentMethod(userId: string, paymentMethod: PaymentMethod): Subscription | null {
  const subscription = getSubscription(userId);
  if (!subscription) return null;

  subscription.paymentMethod = paymentMethod;
  saveSubscription(subscription);

  return subscription;
}

/**
 * Create invoice
 */
function createInvoice(subscription: Subscription): Invoice {
  const plan = getPlan(subscription.tier);
  const amount = subscription.billingCycle === 'monthly'
    ? plan.price.monthly
    : plan.price.yearly;

  const invoice: Invoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    subscriptionId: subscription.id,
    amount,
    currency: 'USD',
    status: 'paid',
    date: Date.now(),
    description: `${plan.name} - ${subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}`
  };

  saveInvoice(subscription.userId, invoice);
  return invoice;
}

/**
 * Create proration invoice
 */
function createProrationInvoice(subscription: Subscription, amount: number): Invoice {
  const invoice: Invoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    subscriptionId: subscription.id,
    amount: Math.abs(amount),
    currency: 'USD',
    status: 'paid',
    date: Date.now(),
    description: amount > 0 ? 'Plan upgrade (prorated)' : 'Plan downgrade (credit)'
  };

  saveInvoice(subscription.userId, invoice);
  return invoice;
}

/**
 * Get all invoices for user
 */
export function getInvoices(userId: string): Invoice[] {
  try {
    const stored = localStorage.getItem(`${INVOICES_KEY}_${userId}`);
    if (!stored) return [];

    const invoices: Invoice[] = JSON.parse(stored);
    return invoices.sort((a, b) => b.date - a.date);
  } catch {
    return [];
  }
}

/**
 * Save invoice
 */
function saveInvoice(userId: string, invoice: Invoice): void {
  try {
    const invoices = getInvoices(userId);
    invoices.push(invoice);

    // Keep only last 24 invoices
    const limited = invoices.slice(-24);

    localStorage.setItem(`${INVOICES_KEY}_${userId}`, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to save invoice:', error);
  }
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  return subscription.status === 'active' || subscription.status === 'trialing';
}

/**
 * Get days until renewal
 */
export function getDaysUntilRenewal(subscription: Subscription): number {
  const now = Date.now();
  const daysRemaining = Math.ceil((subscription.currentPeriodEnd - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysRemaining);
}

/**
 * Format subscription period
 */
export function formatSubscriptionPeriod(subscription: Subscription): string {
  const start = new Date(subscription.currentPeriodStart);
  const end = new Date(subscription.currentPeriodEnd);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

/**
 * Stripe Checkout (simulated)
 * In production, this would redirect to Stripe Checkout
 */
export async function initiateCheckout(
  userId: string,
  tier: SubscriptionTier,
  billingCycle: 'monthly' | 'yearly'
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would return actual Stripe checkout URL
    const checkoutUrl = `https://checkout.stripe.com/pay/${tier}_${billingCycle}`;

    return {
      success: true,
      checkoutUrl
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to initiate checkout'
    };
  }
}

/**
 * Customer Portal (simulated)
 * In production, this would redirect to Stripe Customer Portal
 */
export async function openCustomerPortal(userId: string): Promise<string | null> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, this would return actual Stripe portal URL
    return `https://billing.stripe.com/session/${userId}`;
  } catch {
    return null;
  }
}

/**
 * Renew subscription (automated)
 * This would be handled by Stripe webhooks in production
 */
export function renewSubscription(subscription: Subscription): void {
  const periodLength = subscription.billingCycle === 'monthly' ? 30 : 365;
  const newPeriodEnd = subscription.currentPeriodEnd + (periodLength * 24 * 60 * 60 * 1000);

  subscription.currentPeriodStart = subscription.currentPeriodEnd;
  subscription.currentPeriodEnd = newPeriodEnd;

  if (subscription.status === 'trialing') {
    subscription.status = 'active';
    subscription.trialEnd = undefined;
  }

  saveSubscription(subscription);
  createInvoice(subscription);
}

export default {
  getSubscription,
  createSubscription,
  updateSubscriptionTier,
  cancelSubscription,
  reactivateSubscription,
  updatePaymentMethod,
  getInvoices,
  isSubscriptionActive,
  getDaysUntilRenewal,
  formatSubscriptionPeriod,
  initiateCheckout,
  openCustomerPortal
};
