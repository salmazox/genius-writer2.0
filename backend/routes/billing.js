const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
const prisma = new PrismaClient();

// Price ID mapping - UPDATE THESE WITH YOUR ACTUAL STRIPE PRICE IDS
const STRIPE_PRICE_IDS = {
  PRO: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_placeholder',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly_placeholder'
  },
  AGENCY: {
    monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY || 'price_agency_monthly_placeholder',
    yearly: process.env.STRIPE_PRICE_AGENCY_YEARLY || 'price_agency_yearly_placeholder'
  },
  ENTERPRISE: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly_placeholder',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly_placeholder'
  }
};

/**
 * POST /api/billing/create-checkout
 * Create a Stripe Checkout Session for subscription
 */
router.post('/create-checkout', authenticate, async (req, res) => {
  try {
    const { plan, billingPeriod = 'monthly' } = req.body;

    // Validation
    if (!plan || !['PRO', 'AGENCY', 'ENTERPRISE'].includes(plan)) {
      return res.status(400).json({
        error: 'Invalid plan',
        message: 'Please select a valid subscription plan'
      });
    }

    if (!['monthly', 'yearly'].includes(billingPeriod)) {
      return res.status(400).json({
        error: 'Invalid billing period',
        message: 'Billing period must be monthly or yearly'
      });
    }

    // Get price ID
    const priceId = STRIPE_PRICE_IDS[plan][billingPeriod];

    if (!priceId) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Stripe price IDs not configured. Please contact support.'
      });
    }

    // Log warning if using placeholder (for development)
    if (priceId.includes('placeholder')) {
      console.warn(`[BILLING] Warning: Using placeholder price ID for ${plan} ${billingPeriod}. Configure STRIPE_PRICE_${plan}_${billingPeriod.toUpperCase()} in environment variables.`);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { subscriptions: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    // Get or create Stripe customer
    let customerId = user.subscriptions[0]?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;
    }

    // Create checkout session with multiple payment methods
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: [
        'card',           // Credit/Debit cards
        'paypal',         // PayPal
        'klarna',         // Klarna
        'sepa_debit',     // SEPA Direct Debit
        'link'            // Stripe Link
      ],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/billing?payment=cancelled`,
      metadata: {
        userId: user.id,
        plan,
        billingPeriod
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan
        }
      },
      // Enable automatic tax calculation if configured
      automatic_tax: {
        enabled: false // Set to true if you have Stripe Tax configured
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect billing address for SEPA and other payment methods
      billing_address_collection: 'required'
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('[BILLING] Checkout creation error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message || 'An error occurred while creating the checkout session'
    });
  }
});

/**
 * POST /api/billing/create-portal-session
 * Create a Stripe Customer Portal session for managing subscription
 */
router.post('/create-portal-session', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { subscriptions: true }
    });

    if (!user || !user.subscriptions[0]?.stripeCustomerId) {
      return res.status(404).json({
        error: 'No subscription found',
        message: 'You do not have an active subscription'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscriptions[0].stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/billing`
    });

    res.json({
      url: session.url
    });
  } catch (error) {
    console.error('[BILLING] Portal session error:', error);
    res.status(500).json({
      error: 'Failed to create portal session',
      message: 'An error occurred while creating the billing portal session'
    });
  }
});

/**
 * GET /api/billing/subscription
 * Get current user subscription details
 */
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!subscription) {
      return res.json({
        subscription: null,
        message: 'No active subscription'
      });
    }

    // Get Stripe subscription details if available
    let stripeSubscription = null;
    if (subscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      } catch (error) {
        console.error('[BILLING] Failed to fetch Stripe subscription:', error);
      }
    }

    res.json({
      subscription: {
        ...subscription,
        stripeDetails: stripeSubscription
      }
    });
  } catch (error) {
    console.error('[BILLING] Get subscription error:', error);
    res.status(500).json({
      error: 'Failed to fetch subscription',
      message: 'An error occurred while retrieving subscription details'
    });
  }
});

/**
 * POST /api/billing/cancel-subscription
 * Cancel user subscription
 */
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        status: 'ACTIVE'
      }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({
        error: 'No active subscription',
        message: 'You do not have an active subscription to cancel'
      });
    }

    // Cancel in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Update in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date()
      }
    });

    res.json({
      message: 'Subscription will be cancelled at the end of the billing period'
    });
  } catch (error) {
    console.error('[BILLING] Cancel subscription error:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: 'An error occurred while cancelling the subscription'
    });
  }
});

/**
 * POST /api/billing/reactivate-subscription
 * Reactivate a cancelled subscription
 */
router.post('/reactivate-subscription', authenticate, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        status: 'CANCELED'
      }
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({
        error: 'No cancelled subscription',
        message: 'You do not have a cancelled subscription to reactivate'
      });
    }

    // Reactivate in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Update in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        canceledAt: null
      }
    });

    res.json({
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    console.error('[BILLING] Reactivate subscription error:', error);
    res.status(500).json({
      error: 'Failed to reactivate subscription',
      message: 'An error occurred while reactivating the subscription'
    });
  }
});

// Get invoices
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get subscription to find Stripe customer ID
    const subscription = await prisma.subscription.findFirst({
      where: { userId }
    });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 12 // Last 12 invoices
    });

    // Transform to frontend format
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number || invoice.id,
      date: new Date(invoice.created * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      amount: (invoice.total / 100).toFixed(2),
      currency: invoice.currency.toUpperCase(),
      status: invoice.status === 'paid' ? 'Paid' :
              invoice.status === 'open' ? 'Pending' :
              invoice.status === 'void' ? 'Void' :
              'Unpaid',
      items: invoice.lines.data.map(line => line.description).join(', '),
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url
    }));

    res.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('[BILLING] Get invoices error:', error);
    res.status(500).json({
      error: 'Failed to fetch invoices',
      message: 'An error occurred while fetching invoices'
    });
  }
});

// Get usage data
router.get('/usage', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's current plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get usage from database (you'll need to implement usage tracking)
    // For now, return structure with zero values that can be populated later
    const usage = await prisma.usage.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }).catch(() => null); // If usage table doesn't exist yet

    res.json({
      usage: usage || {
        aiGenerations: 0,
        documents: 0,
        storage: 0,
        collaborators: 0
      },
      plan: user.plan
    });
  } catch (error) {
    console.error('[BILLING] Get usage error:', error);
    res.status(500).json({
      error: 'Failed to fetch usage data',
      message: 'An error occurred while fetching usage data'
    });
  }
});

// Update billing address and sync with Stripe
router.put('/billing-address', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, postalCode, country } = req.body;

    // Update user's billing address in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        billingStreet: street || null,
        billingCity: city || null,
        billingState: state || null,
        billingPostalCode: postalCode || null,
        billingCountry: country || null
      }
    });

    // Get subscription to find Stripe customer ID
    const subscription = await prisma.subscription.findFirst({
      where: { userId }
    });

    // Sync with Stripe if customer exists
    if (subscription && subscription.stripeCustomerId) {
      await stripe.customers.update(subscription.stripeCustomerId, {
        address: {
          line1: street || '',
          city: city || '',
          state: state || '',
          postal_code: postalCode || '',
          country: country || ''
        }
      });
      console.log(`[BILLING] Billing address synced with Stripe for customer: ${subscription.stripeCustomerId}`);
    }

    res.json({
      message: 'Billing address updated successfully',
      billingAddress: {
        street: updatedUser.billingStreet,
        city: updatedUser.billingCity,
        state: updatedUser.billingState,
        postalCode: updatedUser.billingPostalCode,
        country: updatedUser.billingCountry
      }
    });
  } catch (error) {
    console.error('[BILLING] Update billing address error:', error);
    res.status(500).json({
      error: 'Failed to update billing address',
      message: 'An error occurred while updating billing address'
    });
  }
});

// Get billing address
router.get('/billing-address', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        billingStreet: true,
        billingCity: true,
        billingState: true,
        billingPostalCode: true,
        billingCountry: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      billingAddress: {
        street: user.billingStreet,
        city: user.billingCity,
        state: user.billingState,
        postalCode: user.billingPostalCode,
        country: user.billingCountry
      }
    });
  } catch (error) {
    console.error('[BILLING] Get billing address error:', error);
    res.status(500).json({
      error: 'Failed to fetch billing address',
      message: 'An error occurred while fetching billing address'
    });
  }
});

module.exports = router;
