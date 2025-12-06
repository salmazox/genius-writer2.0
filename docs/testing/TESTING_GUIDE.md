# 🧪 Genius Writer 2.0 - Testing Guide

**Last Updated:** December 6, 2025
**Branch:** `claude/fix-stripe-webhook-https-01P5GqVuDGHtjhbiWGvBp1Dt`
**Status:** ✅ Ready for Testing (All configurations complete!)

---

## 📋 Overview

This guide will help you test all 9 migrated AI components that now use the secure backend API, plus the Stripe payment system.

**Estimated Time:** 30-45 minutes
**Prerequisites:**
- ✅ GEMINI_API_KEY configured in Railway
- ✅ Stripe Test Price IDs configured in Railway
- ✅ Backend deployed and running on Railway
- ✅ Frontend deployed on Vercel

---

## 🔍 Pre-Test Verification

Before testing features, verify your backend is properly configured:

### **1. Check Railway Backend Logs**

Go to Railway Dashboard → Your Backend Service → Logs

**Look for this success message:**
```
✓ Gemini AI service initialized
```

If you see an error instead:
```
✗ Gemini AI service failed to initialize: [error details]
```

**Troubleshooting:**
- Verify GEMINI_API_KEY is set in Railway environment variables
- Check the API key is valid (not expired)
- Ensure Railway service restarted after setting the variable

### **2. Verify Backend API Endpoint**

Test that your backend is responding:

```bash
curl https://api.geniuswriter.de/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-06T..."
}
```

---

## 🤖 AI Feature Testing

Test each migrated component in order. For each test:
1. ✅ Mark if it works
2. ❌ Note any errors
3. 📝 Write down error messages

### **Test 1: Translation Tool** ✅ MIGRATED

**Component:** `src/features/Translator.tsx`
**Backend Endpoint:** `/api/ai/generate`

**Test Steps:**
1. Open Genius Writer app
2. Navigate to **Translator** tool
3. Enter test text: "Hello, this is a test of the translation system."
4. Select target language: **German**
5. Click **Translate**

**Expected Result:**
- Translation appears within 2-3 seconds
- Text is properly translated to German
- No error messages in console

**If It Fails:**
- Open browser console (F12)
- Look for error messages starting with `[AI Service]`
- Check Railway logs for backend errors
- Common issues:
  - "Authentication required" → User not logged in
  - "Rate limit exceeded" → Wait 1 minute
  - "AI generation failed" → Check Railway logs

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 2: Blog Post Generator** ✅ MIGRATED

**Component:** `src/features/GenericTool.tsx` (20+ tools)
**Backend Endpoint:** `/api/ai/stream` (streaming)

**Test Steps:**
1. Navigate to **Content Tools** → **Blog Post Intro**
2. Fill in the form:
   - **Topic:** "Artificial Intelligence in 2025"
   - **Keywords:** "AI, machine learning, automation"
   - **Tone:** Professional
3. Click **Generate**

**Expected Result:**
- Text streams in word-by-word (typewriter effect)
- Blog intro is 2-3 paragraphs
- Content is relevant to topic
- Generation completes within 5-10 seconds

**Additional Tools to Test:**
- **Social Media Post:** Quick 1-2 sentence generation
- **Email Template:** Structured email with greeting/body/closing
- **Product Description:** Marketing-focused content

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 3: Smart Editor (AI Chat)** ✅ MIGRATED

**Component:** `src/features/SmartEditor.tsx`
**Backend Endpoint:** `/api/ai/stream`

**Test Steps:**
1. Create a new document or open existing one
2. Open **AI Chat Assistant** (chat icon)
3. Type question: "Can you help me improve the clarity of this text?"
4. Send message

**Expected Result:**
- AI responds with helpful writing suggestions
- Response streams in real-time
- Can have multi-turn conversation

**Also Test:**
- **Fact Checking:** Highlight text → Click "Check Facts"
- **Tone Analysis:** AI analyzes document tone

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 4: Cover Letter Generator** ✅ MIGRATED

**Component:** `src/features/cv/CoverLetterPanel.tsx`
**Backend Endpoint:** `/api/ai/generate`

**Test Steps:**
1. Navigate to **CV Builder** → **Cover Letter**
2. Enter job details:
   - **Company:** "Tech Innovations GmbH"
   - **Position:** "Senior Software Engineer"
   - **Job Description:** Paste a sample job description
3. Click **Generate Cover Letter**

**Expected Result:**
- Cover letter generates in 5-10 seconds
- Includes proper structure (greeting, body paragraphs, closing)
- Tailored to job description
- Professional tone

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 5: Job Description Analyzer** ✅ MIGRATED

**Component:** `src/features/cv/JobDescriptionPanel.tsx`
**Backend Endpoint:** `/api/ai/generate`

**Test Steps:**
1. Navigate to **CV Builder** → **Job Description**
2. Paste a job description from LinkedIn or Indeed
3. Click **Analyze**

**Expected Result:**
- Extracts key requirements
- Lists required skills
- Identifies experience level needed
- Suggests how to tailor CV

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 6: LinkedIn Post Generator** ✅ MIGRATED

**Component:** `src/features/cv/LinkedInPostsPanel.tsx`
**Backend Endpoint:** `/api/ai/generate`

**Test Steps:**
1. Navigate to **CV Builder** → **LinkedIn Posts**
2. Enter topic: "Got a new job at Tech Innovations!"
3. Select tone: **Professional**
4. Click **Generate**

**Expected Result:**
- LinkedIn post with 2-4 paragraphs
- Includes relevant hashtags
- Professional tone
- Engaging content

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 7: CV Builder (ATS Analysis)** ✅ MIGRATED

**Component:** `src/features/CvBuilder.tsx`
**Backend Endpoint:** `/api/ai/generate`

**Test Steps:**
1. Navigate to **CV Builder**
2. Upload a PDF resume or enter CV text
3. Click **Run ATS Analysis**

**Expected Result:**
- ATS score (0-100%)
- Keyword match analysis
- Formatting suggestions
- Optimization recommendations

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 8: Brand Voice Manager** ✅ MIGRATED

**Component:** `src/features/BrandVoiceManager.tsx`
**Backend Endpoint:** `/api/ai/generate`

**Test Steps:**
1. Navigate to **Brand Voice**
2. Paste sample text (e.g., company description or blog post)
3. Click **Analyze Brand Voice**

**Expected Result:**
- Extracts brand voice characteristics
- Identifies tone (formal, casual, technical, etc.)
- Lists key phrases
- Provides voice description

**Test with Content Generation:**
1. Save the brand voice
2. Go to **Blog Post Generator**
3. Select your saved brand voice
4. Generate content
5. Verify content matches brand voice

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 9: Rich Text Editor (Content Refinement)** ✅ MIGRATED

**Component:** `src/components/RichTextEditor.tsx`
**Backend Endpoint:** `/api/ai/generate`

**Test Steps:**
1. Open any document in the editor
2. Type some rough text: "this is text that need improvement for clarity and grammar"
3. Select the text
4. Click **Refine with AI** (magic wand icon)

**Expected Result:**
- Text improves in 2-3 seconds
- Grammar corrected: "This is text that needs improvement..."
- Clarity enhanced
- Professional tone maintained

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

## 💳 Stripe Payment Testing

Test the complete payment flow using Stripe test cards.

### **Test 10: Subscription Checkout**

**Component:** `backend/routes/billing.js`
**Stripe Mode:** Test/Sandbox

**Test Steps:**

1. **Initiate Checkout:**
   - Navigate to **Pricing** page
   - Click **Upgrade to PRO** (monthly plan)
   - Verify redirects to Stripe Checkout

2. **Verify Checkout Page:**
   - URL should be: `https://checkout.stripe.com/...`
   - Plan shows: **PRO - €39/month**
   - Payment methods available:
     - ✅ Credit Card
     - ✅ PayPal
     - ✅ SEPA Direct Debit (if in Germany)
     - ✅ Klarna (if in Germany)

3. **Test Payment with Test Card:**
   Use Stripe test card:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/26)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any valid ZIP
   ```

4. **Complete Payment:**
   - Click **Subscribe**
   - Should redirect to success page
   - Check your app dashboard shows **PRO** plan

**Expected Result:**
- ✅ Checkout loads successfully
- ✅ Payment processes without errors
- ✅ Redirects to success page
- ✅ User's plan updated to PRO
- ✅ Webhook received (check Railway logs)

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 11: Payment Methods**

Test multiple payment methods work correctly:

**Test Cards:**

| Payment Method | Card Number | Expected Result |
|----------------|-------------|-----------------|
| **Success** | 4242 4242 4242 4242 | Payment succeeds |
| **Decline** | 4000 0000 0000 0002 | Card declined |
| **3D Secure** | 4000 0025 0000 3155 | Requires 3D Secure auth |
| **Insufficient Funds** | 4000 0000 0000 9995 | Insufficient funds error |

**Test Each One:**
1. Try to subscribe with each test card
2. Verify correct behavior (success, decline, etc.)
3. Check error messages are user-friendly

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 12: Subscription Management**

**Test Steps:**

1. **View Active Subscription:**
   - Go to **Account Settings** → **Billing**
   - Should show:
     - Current plan: **PRO**
     - Billing period: **Monthly**
     - Next payment date
     - Amount: **€39**

2. **Cancel Subscription:**
   - Click **Cancel Subscription**
   - Confirm cancellation
   - Should show: "Subscription will end on [date]"

3. **Access After Cancellation:**
   - Try to use AI features
   - Should still work until period ends
   - After period ends, should show upgrade prompt

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 13: Webhook Delivery**

**Check Railway Logs:**

After completing a test payment, check Railway backend logs for:

```
[STRIPE WEBHOOK] Received event: checkout.session.completed
[STRIPE WEBHOOK] Processing subscription for user: [email]
[STRIPE WEBHOOK] Successfully updated user subscription
```

**If webhooks aren't working:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Verify endpoint: `https://api.geniuswriter.de/webhook/stripe`
3. Check "Events to send":
   - ✅ checkout.session.completed
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

## 🔒 Security Testing

Verify security measures are working:

### **Test 14: Rate Limiting**

**Test Steps:**
1. Open **Blog Post Generator**
2. Click **Generate** 10 times rapidly
3. On 11th request, should see error:
   ```
   Rate limit exceeded. Please wait a moment.
   ```

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

### **Test 15: Authentication Required**

**Test Steps:**
1. Open browser in **Incognito/Private mode**
2. Navigate to `https://geniuswriter.de`
3. Try to use AI features without logging in
4. Should redirect to login page or show "Please log in"

**Test Result:** ☐ Pass ☐ Fail
**Notes:** _________________________________

---

## 📊 Testing Summary

**AI Features (9 total):**
- ☐ Translator
- ☐ Blog Post Generator (GenericTool)
- ☐ Smart Editor (AI Chat)
- ☐ Cover Letter Generator
- ☐ Job Description Analyzer
- ☐ LinkedIn Post Generator
- ☐ CV Builder (ATS Analysis)
- ☐ Brand Voice Manager
- ☐ Rich Text Editor (Refinement)

**Payment Features (4 total):**
- ☐ Subscription Checkout
- ☐ Payment Methods
- ☐ Subscription Management
- ☐ Webhook Delivery

**Security Features (2 total):**
- ☐ Rate Limiting
- ☐ Authentication Required

**Total Tests Passed:** _____ / 15

---

## 🐛 Common Issues & Solutions

### **"AI generation failed" Error**

**Symptoms:**
- Error toast: "AI generation failed"
- Console error: `[AI Service] Generation failed`

**Solutions:**
1. **Check Railway Logs:**
   - Go to Railway Dashboard → Backend Service → Logs
   - Look for errors like:
     - `Gemini API error: API key not valid`
     - `Gemini API error: Quota exceeded`

2. **Verify API Key:**
   - Railway Dashboard → Backend Service → Variables
   - Check GEMINI_API_KEY is set correctly
   - No extra spaces before/after the key

3. **Restart Backend:**
   - Railway Dashboard → Backend Service
   - Click **Restart**
   - Wait 30 seconds for service to initialize

---

### **"Authentication required" Error**

**Symptoms:**
- Error: "Authentication required"
- Can't use any AI features

**Solutions:**
1. **Log out and log back in:**
   - Click profile icon → Logout
   - Log back in with your account
   - Try AI feature again

2. **Clear browser cache:**
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear "Cached images and files"
   - Reload page

3. **Check auth token:**
   - Open browser console (F12)
   - Type: `localStorage.getItem('auth_token')`
   - Should show a long JWT token
   - If null, log out and log back in

---

### **"Rate limit exceeded" Error**

**Symptoms:**
- Error: "Rate limit exceeded. Please wait a moment."
- Can't generate content even though you haven't used it much

**Solutions:**
1. **Wait 1 minute:**
   - Rate limit is 10 requests per minute
   - Wait 60 seconds and try again

2. **Check usage limits:**
   - Go to Account Settings → Usage
   - Verify you haven't hit plan limits
   - If FREE plan: 10 AI generations/month
   - If you hit limit, upgrade to PRO

---

### **Payment Checkout Doesn't Load**

**Symptoms:**
- Click "Upgrade to PRO"
- Checkout page doesn't load
- Error in console

**Solutions:**
1. **Check Stripe Price IDs:**
   - Railway Dashboard → Backend Service → Variables
   - Verify these 6 variables are set:
     - STRIPE_PRICE_PRO_MONTHLY
     - STRIPE_PRICE_PRO_YEARLY
     - STRIPE_PRICE_AGENCY_MONTHLY
     - STRIPE_PRICE_AGENCY_YEARLY
     - STRIPE_PRICE_ENTERPRISE_MONTHLY
     - STRIPE_PRICE_ENTERPRISE_YEARLY

2. **Verify Price IDs are valid:**
   - Should start with `price_test_` (Test mode) or `price_` (Live mode)
   - Should NOT contain "placeholder"

3. **Check Railway logs:**
   - Look for error: `Placeholder price ID detected`
   - If you see this, update Price IDs with real ones from Stripe

---

### **Webhook Not Receiving Events**

**Symptoms:**
- Payment succeeds in Stripe
- But user's plan doesn't update in app

**Solutions:**
1. **Verify Webhook Endpoint:**
   - Stripe Dashboard → Developers → Webhooks
   - Check endpoint URL: `https://api.geniuswriter.de/webhook/stripe`
   - Status should be "Enabled"

2. **Check Webhook Secret:**
   - Railway Dashboard → Backend Service → Variables
   - Verify STRIPE_WEBHOOK_SECRET is set
   - Should start with `whsec_`

3. **Test Webhook:**
   - Stripe Dashboard → Webhooks → Your endpoint
   - Click "Send test webhook"
   - Select event: `checkout.session.completed`
   - Check Railway logs for processing message

---

## ✅ Testing Complete Checklist

After all testing is complete:

**Pre-Production:**
- [ ] All 9 AI features tested and working
- [ ] All 4 payment features tested and working
- [ ] Security features tested and working
- [ ] No errors in browser console
- [ ] No errors in Railway logs
- [ ] Webhook delivery confirmed

**Before Switching to Live Mode:**
- [ ] All tests passed with Test Price IDs
- [ ] Ready to create Live products in Stripe
- [ ] Have real credit card ready to test Live mode
- [ ] Understand how to switch Price IDs in Railway

**Production Launch:**
- [ ] Create Live products and prices in Stripe
- [ ] Update Railway with Live Price IDs
- [ ] Test one real payment
- [ ] Monitor for 1 hour after launch
- [ ] Have support email ready for users

---

## 📞 Support

If you encounter issues during testing:

1. **Check Documentation:**
   - `GEMINI_API_MIGRATION.md` - AI backend details
   - `STRIPE_SETUP_GUIDE.md` - Payment configuration
   - `DEPLOYMENT_CHECKLIST.md` - Launch checklist

2. **Check Logs:**
   - Railway Backend Logs (AI errors)
   - Browser Console (Frontend errors)
   - Stripe Dashboard Logs (Payment errors)

3. **Common Log Locations:**
   - Railway: Dashboard → Service → Logs tab
   - Browser: F12 → Console tab
   - Stripe: Dashboard → Developers → Logs

---

**Good luck with testing!** 🚀

Once all tests pass, you're ready to switch to Stripe Live mode and launch to production!
