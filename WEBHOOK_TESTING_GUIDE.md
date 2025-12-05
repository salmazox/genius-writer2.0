# Stripe Webhook Testing Guide

## ✅ What to Check After Test Purchase

### 1. Check Railway Logs

Look for these log entries:

```
✅ Received Stripe webhook: checkout.session.completed
✅ Subscription created/updated for user: <user-id>
✅ User plan updated to: PRO
```

**How to view Railway logs:**
1. Go to https://railway.app
2. Open your project
3. Click on your backend service
4. Click "Deployments" → View latest deployment
5. Click "View Logs"

### 2. Check Stripe Dashboard

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click on your webhook endpoint
3. Look at the **"Attempts"** section
4. You should see successful webhook deliveries with **200 status codes**

Green checkmarks ✅ = Success
Red X ❌ = Failed (check Railway logs for error details)

### 3. Check Your Database

Verify the subscription was saved correctly:

**Option A: Via Railway Prisma Studio (Easy)**
```bash
# In your local terminal
cd backend
npx prisma studio
```

Then check:
- **User table**: Verify user's `plan` field updated (e.g., from FREE to PRO)
- **Subscription table**: Verify new subscription record exists with:
  - `status: "ACTIVE"`
  - `plan: "PRO"`
  - `stripeSubscriptionId: "sub_xxx"`
  - `stripeCustomerId: "cus_xxx"`

**Option B: Via Database Query**
```bash
# Connect to Railway PostgreSQL
# Get connection string from Railway dashboard → PostgreSQL → Connect
```

```sql
-- Check user plan
SELECT id, email, name, plan FROM "User" WHERE email = 'test@example.com';

-- Check subscription
SELECT * FROM "Subscription" WHERE "userId" = '<user-id-from-above>';
```

---

## 🧪 Test Scenarios to Verify

### ✅ Scenario 1: New Subscription
1. User with FREE plan purchases PRO
2. **Expected Results:**
   - User `plan` field → `PRO`
   - New subscription record created
   - Stripe checkout completed successfully
   - Webhook received with 200 status

### ✅ Scenario 2: Plan Upgrade
1. User with PRO plan upgrades to AGENCY
2. **Expected Results:**
   - User `plan` field → `AGENCY`
   - Subscription record updated
   - `customer.subscription.updated` webhook received

### ✅ Scenario 3: Subscription Cancellation
1. User cancels their subscription
2. Go to **Stripe Dashboard → Subscriptions**
3. Click on test subscription → **Cancel subscription**
4. **Expected Results:**
   - `customer.subscription.deleted` webhook received
   - Subscription status → `CANCELLED`
   - User `plan` field → `FREE` (or remains same until period ends, depending on your logic)

### ✅ Scenario 4: Payment Failed
1. Use a test card that will fail: `4000 0000 0000 0341`
2. **Expected Results:**
   - `invoice.payment_failed` webhook received
   - Subscription status → `PAST_DUE`

---

## 🐛 Troubleshooting

### Webhook not received at all

**Check 1: Verify webhook endpoint is accessible**
```bash
curl -I https://genius-writer.up.railway.app/api/webhooks/stripe
# Should return: 405 Method Not Allowed (because it's POST only)
# NOT: 404 Not Found
```

**Check 2: Verify webhook secret in Railway**
1. Go to Railway → Your Project → Backend Service
2. Click "Variables"
3. Ensure `STRIPE_WEBHOOK_SECRET` exists and matches Stripe dashboard

**Check 3: Check Stripe webhook attempts**
1. Stripe Dashboard → Developers → Webhooks
2. Click your endpoint
3. Look at recent attempts - you'll see error details if failed

### Webhook received but returns error (4xx/5xx)

**Check Railway logs for detailed error:**
```bash
# Common errors and fixes:

# Error: "User not found"
# → The metadata userId doesn't match a real user in your DB
# → Use a real user ID from your database when testing

# Error: "Invalid webhook signature"
# → STRIPE_WEBHOOK_SECRET in Railway doesn't match Stripe dashboard
# → Copy the signing secret from Stripe again

# Error: "Plan not found"
# → The plan name in metadata doesn't match expected values
# → Use: FREE, PRO, AGENCY, or ENTERPRISE

# Error: Database connection failed
# → Check DATABASE_URL in Railway environment variables
```

### Subscription created in Stripe but not in database

This usually means the webhook handler is failing. Check:

1. **Railway logs** for error details
2. **Stripe webhook attempts** for response status
3. **Database connection** - can your backend connect to PostgreSQL?

```bash
# Test database connection
cd backend
npx prisma db pull
# Should succeed if database connection works
```

---

## 🚀 Advanced: Test Locally with Stripe CLI

If you want to test webhooks on your local machine:

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Forward Webhooks to Localhost
```bash
# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# You'll see a webhook signing secret (starts with whsec_)
# Copy it and set it as STRIPE_WEBHOOK_SECRET in your .env
```

### Trigger Test Events
```bash
# Trigger a test checkout.session.completed event
stripe trigger checkout.session.completed

# Trigger subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Trigger payment failed
stripe trigger invoice.payment_failed
```

---

## 📋 Complete Test Checklist

Before going to production, verify all these scenarios work:

- [ ] New user creates FREE account
- [ ] FREE user upgrades to PRO
- [ ] PRO user upgrades to AGENCY
- [ ] AGENCY user upgrades to ENTERPRISE
- [ ] User cancels subscription
- [ ] Subscription payment fails
- [ ] User views their subscription in dashboard
- [ ] User opens customer portal (billing page)
- [ ] All webhook events received successfully (check Stripe dashboard)
- [ ] All database records created/updated correctly
- [ ] User plan limits enforced (document creation, AI usage, etc.)
- [ ] Usage stats display correctly in frontend
- [ ] Upgrade prompts show when limits reached

---

## 🎯 Quick Test Commands

### Create Test User
```bash
curl -X POST https://genius-writer.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test12345!",
    "name": "Test User"
  }'
```

### Login and Get Token
```bash
curl -X POST https://genius-writer.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test12345!"
  }'

# Copy the "token" from response
```

### Create Checkout Session
```bash
TOKEN="<your-token-here>"

curl -X POST https://genius-writer.up.railway.app/api/billing/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "plan": "PRO",
    "billingPeriod": "monthly"
  }'

# Open the returned URL in browser
# Complete checkout with test card: 4242 4242 4242 4242
```

### Check Usage Stats
```bash
TOKEN="<your-token-here>"

curl -X GET https://genius-writer.up.railway.app/api/usage \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Stripe Dashboard shows webhook deliveries with **200 OK** status
2. ✅ Railway logs show successful webhook processing
3. ✅ Database shows updated user `plan` and subscription records
4. ✅ Frontend displays correct plan and usage limits
5. ✅ User can access plan-appropriate features
6. ✅ Document creation respects plan limits
7. ✅ Upgrade prompts appear when limits reached

---

## 📚 Resources

- **Stripe Test Cards**: https://stripe.com/docs/testing#cards
- **Webhook Testing**: https://stripe.com/docs/webhooks/test
- **Stripe CLI**: https://stripe.com/docs/stripe-cli

---

**You're ready to test! Start with Method 2 (Create a Real Test Subscription) for the most comprehensive testing.** 🚀
