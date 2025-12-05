/**
 * Billing API Service
 *
 * Handles all billing-related API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://genius-writer.up.railway.app';

interface CreateCheckoutParams {
  plan: 'PRO' | 'AGENCY' | 'ENTERPRISE';
  billingPeriod?: 'monthly' | 'yearly';
}

interface SubscriptionResponse {
  subscription: {
    id: string;
    userId: string;
    plan: string;
    status: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    stripeCurrentPeriodEnd: string | null;
    canceledAt: string | null;
    createdAt: string;
    updatedAt: string;
    stripeDetails?: any;
  } | null;
  message?: string;
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<{
  sessionId?: string;
  url?: string;
  error?: string;
}> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/billing/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('[BILLING API] Create checkout error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create checkout session'
    };
  }
}

/**
 * Create a Stripe customer portal session
 */
export async function createPortalSession(): Promise<{
  url?: string;
  error?: string;
}> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/billing/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create portal session');
    }

    return await response.json();
  } catch (error) {
    console.error('[BILLING API] Create portal error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create portal session'
    };
  }
}

/**
 * Get current user subscription
 */
export async function getSubscription(): Promise<SubscriptionResponse> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/billing/subscription`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('[BILLING API] Get subscription error:', error);
    return {
      subscription: null,
      message: error instanceof Error ? error.message : 'Failed to fetch subscription'
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<{
  message?: string;
  error?: string;
}> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/billing/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('[BILLING API] Cancel subscription error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to cancel subscription'
    };
  }
}

/**
 * Open customer portal (for managing payment methods, invoices, etc.)
 */
export async function openCustomerPortal(): Promise<void> {
  try {
    const result = await createPortalSession();

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.url) {
      // Redirect to Stripe customer portal
      window.location.href = result.url;
    }
  } catch (error) {
    console.error('[BILLING API] Open portal error:', error);
    throw error;
  }
}

export default {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  openCustomerPortal
};
