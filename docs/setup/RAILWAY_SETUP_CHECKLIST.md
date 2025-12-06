# Railway Setup Checklist

## ✅ Step-by-Step Railway Configuration

### 1. PostgreSQL Database Setup

- [ ] In Railway dashboard, click "New" → "Database" → "PostgreSQL"
- [ ] After creation, click on PostgreSQL service
- [ ] Go to Settings → Region → Select **"eu-west-1" (Frankfurt, Germany)**
- [ ] Copy the DATABASE_URL (you'll reference it in backend)

### 2. Backend Service Setup

- [ ] Railway should auto-detect your backend from GitHub repo
- [ ] Click on backend service → Settings → Region → **"eu-west-1" (Frankfurt, Germany)**
- [ ] Settings → Deploy → Set "Root Directory" to `backend`
- [ ] Settings → Deploy → Set "Start Command" to `npm run deploy`

### 3. Environment Variables (Minimal for Auth)

Click backend service → Variables → Raw Editor:

```bash
# Node Configuration
NODE_ENV=production
PORT=3000

# Database (auto-connected from PostgreSQL service)
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}

# JWT Secret (REQUIRED - generate below)
JWT_SECRET=REPLACE_WITH_SECRET_FROM_BELOW

# Frontend URL for CORS
FRONTEND_URL=https://your-vercel-app.vercel.app

# SKIP THESE FOR NOW - Add later
# GEMINI_API_KEY=skip_for_now
# STRIPE_SECRET_KEY=skip_for_now
# STRIPE_WEBHOOK_SECRET=skip_for_now
```

### 4. Generate JWT Secret

Run this command locally:

```bash
openssl rand -base64 32
```

Copy the output and replace `REPLACE_WITH_SECRET_FROM_BELOW` in Railway.

### 5. Deploy & Check Logs

- [ ] Click "Deploy" in Railway
- [ ] Go to "Logs" tab
- [ ] Watch for:
  ```
  ✓ Running Prisma migrations...
  ✓ Server running on port 3000
  ```

### 6. Get Your Backend URL

- [ ] In Railway, go to your backend service
- [ ] Go to Settings → Networking
- [ ] Click "Generate Domain" if not done automatically
- [ ] Copy the URL (e.g., `https://xxx.railway.app`)

### 7. Test Health Check

```bash
curl https://your-backend-url.railway.app/api/health
```

Should return:

```json
{ "status": "ok", "environment": "production" }
```

### 8. Check Database Connection

In Railway logs, you should see:

```
✓ Prisma migrate deploy completed
✓ Server running on port 3000
```

If you see database connection errors, verify:

- Both services in same region (eu-west-1)
- DATABASE_URL is set to `${{PostgreSQL.DATABASE_URL}}`

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**

- Verify PostgreSQL service is running
- Check both services are in eu-west-1
- Verify DATABASE_URL uses `${{PostgreSQL.DATABASE_URL}}`

### Issue: "Migrations fail"

**Solution:**

- Check Prisma schema syntax
- Verify DATABASE_URL is accessible
- Check logs for specific error

### Issue: "Port already in use"

**Solution:**

- Railway handles ports automatically
- Don't set PORT in code, use `process.env.PORT || 3000`

### Issue: "CORS errors"

**Solution:**

- Verify FRONTEND_URL matches your Vercel deployment
- Check frontend is calling correct backend URL

## Next Steps After Successful Deployment

1. ✅ Health check passes
2. ✅ Database connected
3. ✅ Migrations applied
4. ✅ Auth endpoints implemented (signup, login, logout, /me)
5. **→ TEST AUTHENTICATION (see below)**
6. 🔨 Connect frontend to backend auth
7. 🔨 Add Gemini API proxy (later)
8. 🔨 Add Stripe integration (later)

---

## 🎯 Testing Authentication Endpoints

Once Railway is deployed and running, test the authentication system:

### Step 1: Test User Signup

```bash
# Replace with your Railway URL
export API_URL="https://your-backend.railway.app"

curl -X POST $API_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secure_password_123",
    "name": "Test User"
  }'
```

**Expected:** Returns user data and JWT token

### Step 2: Test User Login

```bash
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secure_password_123"
  }'
```

**Expected:** Returns user data and JWT token

**Save the token:**

```bash
export TOKEN="paste_token_here"
```

### Step 3: Test Protected Route (Get Current User)

```bash
curl $API_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Returns current user details

### Step 4: Test Logout

```bash
curl -X POST $API_URL/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** `{ "message": "Logout successful" }`

---

**📖 For complete testing guide with all error cases, see:** `AUTH_TESTING_GUIDE.md`
