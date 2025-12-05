// Load environment variables
require('dotenv').config();

// ============================================================================
// ENVIRONMENT VALIDATION - Fail fast if required variables are missing
// ============================================================================
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Warn about optional but recommended variables
const recommendedEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'FRONTEND_URL'];
const missingRecommended = recommendedEnvVars.filter(envVar => !process.env[envVar]);

if (missingRecommended.length > 0 && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: Missing recommended environment variables for production:');
  missingRecommended.forEach(envVar => console.warn(`   - ${envVar}`));
}

console.log(`✅ Environment validated (${process.env.NODE_ENV || 'development'} mode)`);

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const prisma = new PrismaClient();

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://genius-writer.vercel.app',
  'https://genius-writer-git-claude-fix-backend-docker-build-014t3v7ivvndurb7quvd46va-salmazoxs-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) only in development
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Exact origin matching only - no wildcards for security
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[CORS] Rejected request from origin: ${origin}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// ============================================================================
// STRIPE WEBHOOK - Must be before express.json() to get raw body
// ============================================================================
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[STRIPE WEBHOOK] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[STRIPE WEBHOOK] Received event: ${event.type}`);

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[STRIPE WEBHOOK] Checkout session completed:', session.id);

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const userId = session.metadata.userId;
        const plan = session.metadata.plan || 'PRO';

        if (!userId) {
          console.error('[STRIPE WEBHOOK] No userId in session metadata');
          break;
        }

        // Create or update subscription in database
        await prisma.subscription.upsert({
          where: {
            stripeCustomerId: session.customer
          },
          update: {
            plan,
            status: 'ACTIVE',
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
          },
          create: {
            userId,
            plan,
            status: 'ACTIVE',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });

        // Update user plan
        await prisma.user.update({
          where: { id: userId },
          data: { plan }
        });

        console.log(`[STRIPE WEBHOOK] Subscription created/updated for user: ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('[STRIPE WEBHOOK] Subscription updated:', subscription.id);

        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (dbSubscription) {
          // Determine status
          let status = 'ACTIVE';
          if (subscription.status === 'canceled') status = 'CANCELED';
          else if (subscription.status === 'past_due') status = 'PAST_DUE';
          else if (subscription.status === 'incomplete') status = 'INCOMPLETE';
          else if (subscription.status === 'trialing') status = 'TRIALING';

          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              ...(subscription.status === 'canceled' && { canceledAt: new Date() })
            }
          });

          console.log(`[STRIPE WEBHOOK] Subscription status updated to: ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('[STRIPE WEBHOOK] Subscription deleted:', subscription.id);

        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (dbSubscription) {
          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: 'CANCELED',
              canceledAt: new Date()
            }
          });

          // Downgrade user to FREE plan
          await prisma.user.update({
            where: { id: dbSubscription.userId },
            data: { plan: 'FREE' }
          });

          console.log(`[STRIPE WEBHOOK] User downgraded to FREE plan`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('[STRIPE WEBHOOK] Payment failed for invoice:', invoice.id);

        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription }
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'PAST_DUE' }
          });

          console.log(`[STRIPE WEBHOOK] Subscription marked as PAST_DUE`);
        }
        break;
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.use(cors(corsOptions));
app.use(express.json());

// ============================================================================
// RATE LIMITING - Protect against abuse and DDoS
// ============================================================================
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

// Logging middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// --- Auth Routes ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// --- Document Routes ---
const documentRoutes = require('./routes/documents');
app.use('/api/documents', documentRoutes);

// --- Billing Routes ---
const billingRoutes = require('./routes/billing');
app.use('/api/billing', billingRoutes);

// --- AI Proxy Routes ---
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// --- Usage Stats Routes ---
const usageRoutes = require('./routes/usage');
app.use('/api/usage', usageRoutes);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces for Docker/Railway

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
