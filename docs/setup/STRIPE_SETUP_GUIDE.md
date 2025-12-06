# Stripe Payment System Setup Guide

**CRITICAL**: The payment system is currently **non-functional** because it uses placeholder Price IDs. Follow this guide to configure real Stripe prices.

---

## 🚨 Current Status

**Payment System:** ❌ **BROKEN**
- Using placeholder price IDs like `price_pro_monthly_placeholder`
- These don't exist in your Stripe account
- Checkout will fail when customers try to pay
- **Must be fixed before accepting payments**

---

## 📋 Step-by-Step Setup

### **Step 1: Access Stripe Dashboard**

1. Go to: https://dashboard.stripe.com
2. Log in to your Stripe account
3. Make sure you're in **Live mode** (not Test mode) for production

---

### **Step 2: Create Products & Prices**

You need to create **3 products** with **6 prices** total (monthly + yearly for each):

#### **Product 1: PRO Plan**

1. Go to **Products** → Click **+ Add product**
2. Fill in:
   - **Name:** `Genius Writer Pro`
   - **Description:** `Professional plan with advanced AI features`
   - **Pricing model:** `Recurring`

3. **Create Monthly Price:**
   - **Price:** `€19.99` (or your chosen price)
   - **Billing period:** `Monthly`
   - **Currency:** `EUR`
   - Click **Add price**
   - **Copy the Price ID** (looks like `price_1ABC123...`)
   - Save it as: `STRIPE_PRICE_PRO_MONTHLY`

4. **Create Yearly Price:**
   - Click **Add another price**
   - **Price:** `€199.99` (or your chosen price)
   - **Billing period:** `Yearly`
   - **Currency:** `EUR`
   - Click **Add price**
   - **Copy the Price ID**
   - Save it as: `STRIPE_PRICE_PRO_YEARLY`

#### **Product 2: AGENCY Plan**

1. Click **+ Add product**
2. Fill in:
   - **Name:** `Genius Writer Agency`
   - **Description:** `Agency plan with unlimited usage and team features`
   - **Pricing model:** `Recurring`

3. **Create Monthly Price:**
   - **Price:** `€49.99`
   - **Billing period:** `Monthly`
   - **Currency:** `EUR`
   - **Copy the Price ID** → Save as: `STRIPE_PRICE_AGENCY_MONTHLY`

4. **Create Yearly Price:**
   - **Price:** `€499.99`
   - **Billing period:** `Yearly`
   - **Currency:** `EUR`
   - **Copy the Price ID** → Save as: `STRIPE_PRICE_AGENCY_YEARLY`

#### **Product 3: ENTERPRISE Plan**

1. Click **+ Add product**
2. Fill in:
   - **Name:** `Genius Writer Enterprise`
   - **Description:** `Enterprise plan with custom features and dedicated support`
   - **Pricing model:** `Recurring`

3. **Create Monthly Price:**
   - **Price:** `€99.99`
   - **Billing period:** `Monthly`
   - **Currency:** `EUR`
   - **Copy the Price ID** → Save as: `STRIPE_PRICE_ENTERPRISE_MONTHLY`

4. **Create Yearly Price:**
   - **Price:** `€999.99`
   - **Billing period:** `Yearly`
   - **Currency:** `EUR`
   - **Copy the Price ID** → Save as: `STRIPE_PRICE_ENTERPRISE_YEARLY`

---

### **Step 3: Configure Railway Environment Variables**

1. Go to your **Railway dashboard**: https://railway.app
2. Select your **backend service**
3. Click **Variables** tab
4. Add these **6 variables** (one for each price ID you copied):

```env
STRIPE_PRICE_PRO_MONTHLY=price_1ABC123...
STRIPE_PRICE_PRO_YEARLY=price_1DEF456...
STRIPE_PRICE_AGENCY_MONTHLY=price_1GHI789...
STRIPE_PRICE_AGENCY_YEARLY=price_1JKL012...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1MNO345...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1PQR678...
```

**Replace** the example values with your **actual Price IDs** from Stripe!

5. Click **Save** or **Deploy** (Railway will auto-restart)

---

### **Step 4: Verify Configuration**

After Railway restarts:

1. Check Railway logs for errors
2. Try creating a checkout session from your app
3. Verify you can see the correct prices in Stripe Checkout
4. Test a payment in **Test mode** first

---

## 💰 Recommended Pricing Structure

Here's a suggested pricing model based on your app's features:

| Plan | Monthly | Yearly | Savings |
|------|---------|--------|---------|
| **FREE** | €0 | €0 | - |
| **PRO** | €19.99 | €199.99 | 17% |
| **AGENCY** | €49.99 | €499.99 | 17% |
| **ENTERPRISE** | €99.99 | €999.99 | 17% |

**Features by Plan:**

- **FREE**: Limited usage (10 AI generations/month), basic tools
- **PRO**: Unlimited AI, all tools, brand voices, document export
- **AGENCY**: Everything in Pro + team collaboration, white-label
- **ENTERPRISE**: Everything + custom integrations, priority support, custom training

---

## 🔧 Technical Details

### **Current Code Location:**
`/backend/routes/billing.js` (lines 10-23)

### **How It Works:**
```javascript
const STRIPE_PRICE_IDS = {
  PRO: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'placeholder',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'placeholder'
  },
  // ... etc
};
```

**Before configuration:** Uses placeholder → Checkout fails
**After configuration:** Uses real Price IDs → Checkout works ✅

### **Production Protection:**
The code now **blocks** placeholder IDs in production:
```javascript
if (process.env.NODE_ENV === 'production' && priceId.includes('placeholder')) {
  return res.status(503).json({
    error: 'Payment system not configured',
    message: 'Payment processing is temporarily unavailable.'
  });
}
```

This prevents customers from seeing confusing Stripe errors.

---

## ✅ Verification Checklist

Before going live:

- [ ] Created all 3 products in Stripe
- [ ] Created 6 prices (monthly + yearly for each)
- [ ] Copied all 6 Price IDs
- [ ] Set all 6 environment variables in Railway
- [ ] Railway backend restarted successfully
- [ ] Tested checkout flow in Test mode
- [ ] Verified webhook endpoint is configured
- [ ] Tested successful payment
- [ ] Tested subscription cancellation
- [ ] Tested webhook delivery

---

## 🚨 Important Notes

1. **Test Mode vs Live Mode:**
   - Use **Test mode** Price IDs for testing
   - Use **Live mode** Price IDs for production
   - Don't mix them!

2. **Webhook Configuration:**
   - Make sure your webhook endpoint is set: `https://api.geniuswriter.de/api/billing/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Currency:**
   - Currently set to EUR (€)
   - To change, update prices in Stripe + frontend display

4. **VAT/Tax:**
   - Consider enabling Stripe Tax for automatic tax calculation
   - Required for EU customers

---

## 🆘 Troubleshooting

### **"Invalid price ID" error**
- Double-check you copied the Price ID correctly
- Make sure you're using the right mode (Test/Live)
- Price IDs start with `price_`

### **Checkout shows wrong amount**
- Verify the price in Stripe Dashboard
- Check if tax is being added
- Ensure currency matches (EUR)

### **Environment variables not working**
- Restart Railway service manually
- Check for typos in variable names
- Verify variables are saved (not drafts)

### **Still using placeholders after setup**
- Check Railway logs for `[BILLING] ERROR: Placeholder price ID detected`
- Verify environment variables are set correctly
- Try redeploying the backend

---

## 📚 Additional Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Pricing Guide](https://stripe.com/docs/billing/prices-guide)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

**Questions?** Check the Stripe documentation or Railway support.
