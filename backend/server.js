// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const prisma = new PrismaClient();

// CORS Configuration - GDPR Compliant
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Stripe Webhook needs raw body, so we define it before JSON parser
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // TODO: Fulfill the purchase, update user plan in DB
      console.log('Payment successful for user:', session.customer);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// --- Auth Routes ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// --- Billing Routes ---
app.post('/api/billing/create-checkout', async (req, res) => {
  // Logic: Create Stripe Checkout Session
  res.json({ url: "https://stripe.com/checkout..." });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces for Docker/Railway

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
