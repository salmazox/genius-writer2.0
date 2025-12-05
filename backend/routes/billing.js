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

    if (!priceId || priceId.includes('placeholder')) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Stripe price IDs not configured. Please contact support.'
      });
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
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
      }
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

module.exports = router;
