# 🧪 Stripe Webhook Testing Guide

## ⚠️ Important: Don't Test Webhooks in Browser!

**Opening `https://genius-writer.up.railway.app/api/webhooks/stripe` in a browser will show "Internal Server Error"**

**Why?**
- Browser sends GET request
- Webhook only accepts POST requests from Stripe
- Webhook requires special Stripe signature header
- ✅ **This error is NORMAL and EXPECTED**

---

## ✅ Method 1: Stripe Dashboard Test (RECOMMENDED)

### Step-by-Step:

1. **Open Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/test/webhooks

2. **Click your webhook endpoint**
   - Should show: `https://genius-writer.up.railway.app/api/webhooks/stripe`

3. **Click "Send test webhook" button** (top right)

4. **Select an event to test:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

5. **Click "Send test webhook"**

6. **Check the response:**
   - ✅ **Success**: HTTP 200 with `{"received": true}`
   - ❌ **Failed**: Check the error message

### Expected Success Response:
```json
{
  "received": true
}
```

---

## ✅ Method 2: Real Checkout Test

### Step-by-Step:

1. **Go to your app**: https://genius-writer.up.railway.app

2. **Log in or create test account**

3. **Click "Upgrade to Pro"** (or your subscription button)

4. **Use Stripe test card:**
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/25 (any future date)
   CVC: 123 (any 3 digits)
   ZIP: 12345 (any 5 digits)
   ```

5. **Complete checkout**

6. **Check Railway logs:**
   - Railway Dashboard → Backend Service → Logs
   - Look for: `[STRIPE WEBHOOK] Received event: checkout.session.completed`

---

## 🔍 How to Check Railway Logs

### Via Railway Dashboard:
1. Go to: https://railway.app
2. Select your project
3. Click **Backend service**
4. Click **Deployments**
5. Click latest deployment
6. Click **View Logs**

### What to look for:

✅ **Success:**
```
[STRIPE WEBHOOK] Received event: checkout.session.completed
[STRIPE WEBHOOK] Checkout session completed: cs_test_abc123
[STRIPE WEBHOOK] Subscription created/updated for user: usr_123
```

❌ **Errors:**
```
[STRIPE WEBHOOK] Signature verification failed: No signatures found...
[STRIPE WEBHOOK] No userId in session metadata
[STRIPE WEBHOOK] Error processing webhook: ...
```

---

## 🐛 Common Issues & Solutions

### Issue: "Signature verification failed"
**Cause**: Wrong webhook secret or not set
**Fix**:
```bash
# Check Railway environment variables
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret
```

### Issue: "No userId in session metadata"
**Cause**: Checkout session created without userId
**Fix**: Ensure your checkout session includes:
```javascript
metadata: {
  userId: user.id,
  plan: 'PRO'
}
```

### Issue: Webhook shows in Stripe but not triggering
**Cause**: Wrong URL or HTTPS issue
**Fix**: Verify endpoint URL is exactly:
```
https://genius-writer.up.railway.app/api/webhooks/stripe
```
⚠️ Must include `https://` at the beginning!

---

## ✅ Quick Checklist

Before testing, verify:

- [ ] Webhook endpoint exists in Stripe Dashboard
- [ ] Endpoint URL: `https://genius-writer.up.railway.app/api/webhooks/stripe`
- [ ] HTTPS (not HTTP) ✅
- [ ] 4 events selected in Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` set in Railway
- [ ] Backend deployed and running
- [ ] Database connected

---

## 🚀 Next Steps

1. **Test using Method 1** (Stripe Dashboard) first
2. If successful, try **Method 2** (Real checkout)
3. **Check logs** after each test
4. If you see errors, check the troubleshooting section above

---

## 📝 Test Results Template

After testing, record your results:

```
Date: ___________
Method: [ ] Stripe Dashboard  [ ] Real Checkout

Event Tested: ___________________
HTTP Response: ___________________
Logs Output:
___________________________________
___________________________________

Status: [ ] ✅ Success  [ ] ❌ Failed
Notes:
___________________________________
```

---

**Remember**: You cannot test webhooks by opening the URL in a browser!
Always use the Stripe Dashboard or trigger real events.
