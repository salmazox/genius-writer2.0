# Genius Writer 2.0 - Deployment Guide

## 🚀 Pre-Launch Checklist

Before deploying to production, complete ALL items in this checklist:

### 1. **Environment Configuration**

#### Backend Environment Variables
Create/update `.env` file in `/backend` directory:

```env
# REQUIRED
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=<generate with: openssl rand -base64 32>
GEMINI_API_KEY=your_gemini_api_key_here

# STRIPE (Required for payments)
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_AGENCY_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_AGENCY_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxxxxxxxxxxxx

# SMTP (Required for password reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@geniuswriter.com
SMTP_FROM_NAME=Genius Writer

# Frontend URL (for CORS and email links)
FRONTEND_URL=https://your-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment Variables
Create/update `.env.local` file in root directory:

```env
# Backend API URL
VITE_API_URL=https://your-backend.up.railway.app

# Optional: Analytics
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_GA_MEASUREMENT_ID=G-...
```

### 2. **Stripe Setup**

1. **Create Products in Stripe Dashboard**:
   - Go to https://dashboard.stripe.com/products
   - Create products for PRO, AGENCY, and ENTERPRISE plans
   - Create both monthly and yearly prices for each
   - Copy the price IDs and update your backend `.env`

2. **Set up Webhook**:
   - Go to https://dashboard.stripe.com/webhooks
   - Create endpoint: `https://your-backend-url/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy webhook signing secret and update `STRIPE_WEBHOOK_SECRET`

3. **Enable Customer Portal**:
   - Go to https://dashboard.stripe.com/settings/billing/portal
   - Configure portal settings
   - Enable subscription management

### 3. **Email Service Setup**

#### Option A: Gmail
1. Enable 2-factor authentication
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use App Password as `SMTP_PASS`

#### Option B: SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

#### Option C: Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_mailgun_smtp_password
```

### 4. **Database Setup (Railway)**

1. Create PostgreSQL database in Railway:
   - Go to https://railway.app
   - Create new project → Add PostgreSQL
   - Copy `DATABASE_URL` from variables

2. Run migrations:
```bash
cd backend
npx prisma migrate deploy
```

### 5. **Legal Information**

**CRITICAL**: Update legal information in `src/pages/LegalPage.tsx`:
- Replace all placeholder text with actual company information
- Fill in:
  - Company name and address
  - Managing directors
  - Contact information (email, phone)
  - Commercial register number (if applicable)
  - VAT ID or Tax number
  - Insurance information (if applicable)

**⚠️ German law requires accurate Impressum. Failure to provide correct information can result in fines!**

### 6. **Deploy Backend (Railway)**

1. Connect GitHub repository to Railway
2. Configure service:
   - Root Directory: `/backend`
   - Start Command: `npm run deploy`
   - Add all environment variables from step 1

3. Deploy and verify:
```bash
curl https://your-backend-url/api/health
# Should return: {"status":"ok","environment":"production"}
```

### 7. **Deploy Frontend (Vercel)**

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Vite
   - Root Directory: `/`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL

4. Deploy and verify homepage loads

### 8. **Test Critical Flows**

Before announcing launch, test these flows end-to-end:

#### Authentication Flow
- [ ] User signup with valid email/password
- [ ] Email validation working
- [ ] User login
- [ ] Password reset request (check email received)
- [ ] Password reset completion
- [ ] Logout

#### Payment Flow
- [ ] Create checkout session
- [ ] Complete payment (use Stripe test cards in test mode)
- [ ] Webhook received and subscription created
- [ ] User plan updated in database
- [ ] Verify subscription in user dashboard

#### Document Flow
- [ ] Create new document
- [ ] Save document to backend
- [ ] Update document
- [ ] Create document version
- [ ] Restore previous version
- [ ] Delete document (soft delete)
- [ ] Restore deleted document
- [ ] Permanently delete document

#### AI Generation Flow
- [ ] Generate content via AI proxy
- [ ] Verify usage tracking incremented
- [ ] Test usage limits (create test FREE account)
- [ ] Verify rate limiting works

### 9. **Security Checks**

- [ ] Debug endpoints NOT accessible in production
- [ ] CORS only allows your frontend domain
- [ ] API key NOT exposed in frontend bundle
- [ ] Rate limiting active
- [ ] HTTPS enabled on both frontend and backend
- [ ] Stripe webhooks using signing secret
- [ ] JWT tokens have reasonable expiration
- [ ] Passwords hashed with bcrypt

### 10. **Performance Checks**

- [ ] Backend responds < 200ms for simple requests
- [ ] Frontend initial load < 3 seconds
- [ ] Database connection pooling configured
- [ ] Frontend assets minified and compressed
- [ ] Images optimized

---

## 📦 **Installation Commands**

### Backend Dependencies
```bash
cd backend
npm install

# Install dependencies added in this update:
# - express-rate-limit (rate limiting)
# - @google/genai (AI proxy)
```

### Frontend (No changes needed)
```bash
npm install
```

---

## 🔄 **Database Migrations**

If you need to update the database schema:

```bash
cd backend

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## 🧪 **Testing**

### Manual Testing Checklist

1. **Authentication**:
   ```bash
   # Signup
   curl -X POST https://your-api/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123456","name":"Test User","termsAccepted":true}'

   # Login
   curl -X POST https://your-api/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123456"}'
   ```

2. **Protected Routes**:
   ```bash
   # Get user profile
   curl https://your-api/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Documents**:
   ```bash
   # List documents
   curl https://your-api/api/documents \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **AI Generation**:
   ```bash
   # Generate content
   curl -X POST https://your-api/api/ai/generate \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Write a blog post about AI","templateId":"blog-post"}'
   ```

---

## 📊 **Monitoring**

### What to Monitor

1. **Application Metrics**:
   - API response times
   - Error rates
   - Database query performance
   - Memory usage

2. **Business Metrics**:
   - User signups
   - Subscription conversions
   - AI generation usage
   - Document creation rate

3. **Costs**:
   - Gemini API usage/costs
   - Database storage
   - Bandwidth

### Recommended Tools

- **Application Monitoring**: Sentry, New Relic, or DataDog
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Log Management**: LogRocket, Papertrail
- **Analytics**: Google Analytics, Mixpanel

---

## 🚨 **Troubleshooting**

### Backend won't start
```bash
# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? 'DB OK' : 'DB MISSING')"

# Test database connection
cd backend
npx prisma db push
```

### Stripe webhook not working
1. Check webhook signing secret is correct
2. Verify webhook endpoint is accessible
3. Check Railway logs for errors
4. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### CORS errors
1. Verify `FRONTEND_URL` environment variable is set
2. Check frontend origin matches exactly (no trailing slashes)
3. Verify CORS middleware is before routes

### Email not sending
1. Check SMTP credentials
2. Verify port (587 for TLS, 465 for SSL)
3. Check Railway logs for email service errors
4. Test with development mode (logs reset link to console)

---

## 🔐 **Security Best Practices**

1. **Never commit secrets to git**
   - Use `.env` files (already in `.gitignore`)
   - Rotate secrets regularly

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Monitor for vulnerabilities**
   - Enable Dependabot on GitHub
   - Use Snyk or similar tools

4. **Regular backups**
   - Railway provides automatic PostgreSQL backups
   - Test restore procedure monthly

5. **Rate limiting**
   - Already configured
   - Monitor for abuse patterns

---

## 📝 **Post-Launch Tasks**

### Immediate (Week 1)
- [ ] Monitor error rates daily
- [ ] Check user feedback
- [ ] Verify all email notifications working
- [ ] Monitor Stripe webhook success rate
- [ ] Check database performance

### Short-term (Month 1)
- [ ] Implement proper logging (replace console.log)
- [ ] Set up automated testing
- [ ] Add usage analytics
- [ ] Optimize database indexes
- [ ] Implement caching layer (Redis)

### Long-term (Quarter 1)
- [ ] Build admin dashboard
- [ ] Implement real-time collaboration
- [ ] Add API access feature
- [ ] Build mobile apps
- [ ] Implement SSO/OAuth

---

## 📧 **Support**

If you encounter issues during deployment:

1. Check Railway logs: `railway logs`
2. Check Vercel logs in dashboard
3. Verify all environment variables are set
4. Test API endpoints with curl
5. Check browser console for frontend errors

---

## ✅ **Ready to Launch?**

Before going live, ensure:
- [x] All security fixes applied
- [ ] All environment variables configured
- [ ] Legal information updated
- [ ] Email service working
- [ ] Stripe integration tested
- [ ] Critical user flows tested
- [ ] Monitoring set up
- [ ] Backup strategy in place

**Good luck with your launch! 🚀**
