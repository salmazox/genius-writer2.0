# Backend Deployment Guide for Railway

## Quick Setup

### 1. Configure Start Command in Railway

In Railway dashboard:

1. Click on your backend service
2. Go to **Settings** → **Deploy**
3. Set **Start Command** to:
   ```
   npm run deploy
   ```

This will automatically run database migrations before starting the server.

### 2. Required Environment Variables

Set these in Railway **Variables**:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
JWT_SECRET=your_generated_secret_here
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=https://your-vercel-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Region Settings (GDPR/DSGVO Compliance)

**IMPORTANT:** Set both services to Germany/Frankfurt:

- PostgreSQL: Settings → Region → **eu-west-1**
- Backend API: Settings → Region → **eu-west-1**

### 4. Scripts Available

- `npm start` - Start server (production)
- `npm run dev` - Start with nodemon (development)
- `npm run deploy` - Run migrations + start server (Railway)

### 5. Database Migrations

Migrations run automatically on each deploy via `npm run deploy`.

To run manually:

```bash
railway run npx prisma migrate deploy
```

### 6. Health Check

After deployment, test:

```bash
curl https://your-app.railway.app/api/health
```

Should return:

```json
{ "status": "ok", "environment": "production" }
```

## Troubleshooting

**Build fails:**

- Check Railway logs for errors
- Verify Dockerfile is correct
- Ensure all dependencies are in package.json

**Database connection fails:**

- Verify DATABASE_URL is set to `${{PostgreSQL.DATABASE_URL}}`
- Check PostgreSQL service is running
- Ensure both services are in same region

**Migrations fail:**

- Check DATABASE_URL is accessible
- Verify Prisma schema is valid
- Check Railway logs for specific error

## GDPR Compliance Checklist

- [x] Database in EU region (Frankfurt)
- [x] Backend in EU region (Frankfurt)
- [x] CORS configured with frontend URL
- [ ] Add data retention policies
- [ ] Implement user data export
- [ ] Implement user data deletion
