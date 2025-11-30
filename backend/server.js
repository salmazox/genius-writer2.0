const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const prisma = new PrismaClient();

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

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// --- Auth Routes Placeholders ---
app.post('/api/auth/signup', async (req, res) => {
  // Logic: Hash password, create User in Prisma
  res.json({ message: "Signup endpoint ready" });
});

app.post('/api/auth/login', async (req, res) => {
  // Logic: Verify password, issue JWT
  res.json({ message: "Login endpoint ready" });
});

// --- Billing Routes ---
app.post('/api/billing/create-checkout', async (req, res) => {
  // Logic: Create Stripe Checkout Session
  res.json({ url: "https://stripe.com/checkout..." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
