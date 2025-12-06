# Cloudflare Turnstile Setup Guide

## 🛡️ What is Cloudflare Turnstile?

Cloudflare Turnstile is a **privacy-friendly CAPTCHA alternative** that:
- ✅ **No puzzles** - Better UX than reCAPTCHA
- ✅ **Privacy-first** - No tracking or cookies
- ✅ **Free tier** - 1M verifications/month
- ✅ **Invisible mode** - Challenges only bots
- ✅ **Fast** - 99.9% of users never see a challenge

---

## 📋 Step 1: Get Turnstile Keys

### **A. Create Cloudflare Account**
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (free account is fine)
3. Verify your email

### **B. Get Turnstile Site Keys**
1. Go to https://dash.cloudflare.com
2. Click **Turnstile** in the left sidebar
3. Click **Add Site**

**Configuration:**
- **Site Name:** `Genius Writer`
- **Domain:** `geniuswriter.de` (and `localhost` for testing)
- **Widget Mode:** `Managed` (recommended - invisible for most users)
- **Pre-Clearance:** Leave default

4. Click **Create**

**You'll receive 2 keys:**
- 🔑 **Site Key** (public, goes in frontend)
- 🔒 **Secret Key** (private, goes in backend)

**Save these keys!** You'll need them in the next steps.

---

## 📋 Step 2: Backend Setup

### **A. Add Secret Key to Railway**

1. Go to Railway Dashboard
2. Click your **backend service**
3. Go to **Variables**
4. Add new variable:
   ```
   TURNSTILE_SECRET_KEY=0x4AAAAAAA... (your secret key)
   ```
5. Save (Railway will auto-redeploy)

### **B. Create Verification Utility**

Already created for you! See: `backend/utils/turnstile.js` (created below)

### **C. Update Auth Routes**

Already integrated! The signup/login routes will verify Turnstile tokens.

---

## 📋 Step 3: Frontend Setup

### **A. Add Site Key to Vercel**

1. Go to Vercel Dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   VITE_TURNSTILE_SITE_KEY=0x4AAAAAAA... (your site key)
   ```
5. Click **Save**
6. Redeploy

### **B. Add Turnstile Component**

Already created! See: `src/components/TurnstileWidget.tsx` (created below)

### **C. Integration in Forms**

The Turnstile widget is already integrated into:
- ✅ Signup form
- ✅ Login form
- ✅ Password reset form

---

## 📋 Step 4: Testing

### **Test Keys (for development):**

Cloudflare provides test keys that always pass/fail:

**Always Pass:**
```
Site Key: 1x00000000000000000000AA
Secret: 1x0000000000000000000000000000000AA
```

**Always Fail:**
```
Site Key: 2x00000000000000000000AB
Secret: 2x0000000000000000000000000000000AB
```

**Force Interactive Challenge:**
```
Site Key: 3x00000000000000000000FF
Secret: 3x0000000000000000000000000000000FF
```

---

## 🎯 How It Works

```mermaid
User Flow:
1. User visits signup/login page
2. Turnstile widget loads invisibly
3. User fills form and clicks submit
4. Turnstile runs invisible check:
   ├─ Human detected → Token issued (instant)
   └─ Bot suspected → Challenge shown
5. Frontend sends form + Turnstile token to backend
6. Backend verifies token with Cloudflare
7. If valid → Process request
   If invalid → Reject with error
```

---

## ⚙️ Configuration Options

### **Widget Modes:**

1. **Managed (Recommended)** ✅
   - Invisible for 99% of users
   - Shows challenge only for suspicious traffic
   - Best UX

2. **Non-Interactive**
   - Always invisible
   - Never shows challenge
   - Lower security

3. **Invisible**
   - Fully invisible
   - Programmatically triggered

### **Appearance:**

You can customize the widget theme in `TurnstileWidget.tsx`:
```typescript
theme: 'auto' | 'light' | 'dark'
size: 'normal' | 'compact'
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Always verify tokens on the backend
- Use different keys for dev/production
- Set correct domain in Cloudflare dashboard
- Implement rate limiting alongside Turnstile
- Log verification failures

### ❌ DON'T:
- Don't skip backend verification
- Don't reuse tokens (they're one-time use)
- Don't expose secret key in frontend
- Don't trust client-side validation only

---

## 📊 Monitoring

### **Cloudflare Dashboard:**
- Go to Cloudflare → Turnstile
- View analytics:
  - Total verifications
  - Pass/fail rate
  - Challenge solve rate
  - Top countries

### **Backend Logs:**
Check Railway logs for:
```
[TURNSTILE] Verification successful for user: test@example.com
[TURNSTILE] Verification failed: Invalid token
```

---

## 🐛 Troubleshooting

### **"Turnstile verification failed"**
**Causes:**
- Wrong secret key in backend
- Token already used (refresh page)
- Domain mismatch in Cloudflare settings

**Fix:**
- Verify `TURNSTILE_SECRET_KEY` in Railway
- Check domain is added in Cloudflare Turnstile dashboard

### **Widget not appearing**
**Causes:**
- Wrong site key in frontend
- Script blocked by ad blocker
- CSP policy blocking Cloudflare

**Fix:**
- Verify `VITE_TURNSTILE_SITE_KEY` in Vercel
- Disable ad blocker for testing
- Add Cloudflare to CSP whitelist

### **"Token expired"**
**Cause:** Token is valid for 5 minutes only

**Fix:** User needs to refresh and try again

---

## 📦 Files Created

Backend:
- `backend/utils/turnstile.js` - Verification utility
- `backend/routes/auth.js` - Updated with Turnstile checks

Frontend:
- `src/components/TurnstileWidget.tsx` - React component
- `src/pages/AuthPageEnhanced.tsx` - Integrated widget
- `src/pages/ForgotPasswordPage.tsx` - Integrated widget

---

## 🚀 Going Live

**Before production:**

1. ✅ Replace test keys with real keys
2. ✅ Set correct domains in Cloudflare
3. ✅ Test signup/login flows
4. ✅ Monitor Cloudflare analytics
5. ✅ Set up alerts for high failure rates

**Production Checklist:**
- [ ] Real Turnstile keys in Vercel
- [ ] Real secret key in Railway
- [ ] `geniuswriter.de` added to Turnstile allowed domains
- [ ] Tested on live site
- [ ] Monitoring enabled

---

## 💰 Pricing

**Cloudflare Turnstile:**
- **Free Tier:** 1,000,000 verifications/month
- **Enterprise:** Custom pricing for 1M+ verifications

For most SaaS apps, the free tier is more than enough!

---

## 🔗 Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/turnstile/
- **Dashboard:** https://dash.cloudflare.com/turnstile
- **API Reference:** https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

---

**Last Updated:** December 2025
**Status:** Ready to implement ✅
