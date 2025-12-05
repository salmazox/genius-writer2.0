# Authentication Testing Guide

## Overview

Authentication system is now fully implemented with:

- ✅ User signup with bcrypt password hashing
- ✅ User login with JWT token generation
- ✅ Protected routes with JWT verification
- ✅ Session management in database
- ✅ Logout functionality
- ✅ Get current user endpoint

## Prerequisites

Before testing, ensure:

1. Railway backend is deployed and running
2. PostgreSQL database is connected
3. Environment variables are set (especially `JWT_SECRET`)
4. Database migrations have been applied

## Testing Locally (Optional)

If you want to test locally before deploying:

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL and JWT_SECRET

# Run migrations
npx prisma migrate deploy

# Start server
npm run dev
```

## Testing on Railway

Once deployed to Railway, use your Railway backend URL:

```bash
# Example Railway URL (replace with yours)
export API_URL="https://your-backend.railway.app"
```

### 1. Health Check (No Auth Required)

```bash
curl $API_URL/api/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "environment": "production"
}
```

### 2. User Signup

```bash
curl -X POST $API_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secure_password_123",
    "name": "Test User"
  }'
```

**Expected Response (201):**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User",
    "plan": "FREE",
    "createdAt": "2025-12-05T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token for next requests:**

```bash
export TOKEN="paste_token_here"
```

### 3. User Login

```bash
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "secure_password_123"
  }'
```

**Expected Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User",
    "plan": "FREE",
    "avatar": null,
    "bio": null,
    "createdAt": "2025-12-05T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Get Current User (Protected Route)

```bash
curl $API_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": null,
    "bio": null,
    "plan": "FREE",
    "createdAt": "2025-12-05T10:00:00.000Z",
    "updatedAt": "2025-12-05T10:00:00.000Z"
  }
}
```

### 5. Logout (Protected Route)

```bash
curl -X POST $API_URL/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "message": "Logout successful"
}
```

### 6. Clear All Sessions (Protected Route)

Logout from all devices:

```bash
curl -X DELETE $API_URL/api/auth/sessions \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**

```json
{
  "message": "All sessions cleared",
  "count": 3
}
```

## Error Responses

### Missing Fields (400)

```bash
curl -X POST $API_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Response:**

```json
{
  "error": "Missing required fields",
  "message": "Email, password, and name are required"
}
```

### Invalid Email (400)

```bash
curl -X POST $API_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "name": "Test"
  }'
```

**Response:**

```json
{
  "error": "Invalid email",
  "message": "Please provide a valid email address"
}
```

### Weak Password (400)

```bash
curl -X POST $API_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "short",
    "name": "Test"
  }'
```

**Response:**

```json
{
  "error": "Weak password",
  "message": "Password must be at least 8 characters long"
}
```

### User Already Exists (409)

```json
{
  "error": "User already exists",
  "message": "An account with this email already exists"
}
```

### Invalid Credentials (401)

```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

### No Token Provided (401)

```bash
curl $API_URL/api/auth/me
```

**Response:**

```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

### Invalid Token (401)

```bash
curl $API_URL/api/auth/me \
  -H "Authorization: Bearer invalid_token_here"
```

**Response:**

```json
{
  "error": "Invalid token",
  "message": "Token verification failed"
}
```

### Expired Token (401)

```json
{
  "error": "Token expired",
  "message": "Please login again"
}
```

## Database Verification

To verify users are being created in the database:

```bash
# In Railway CLI or using Railway dashboard
railway run npx prisma studio
```

Or query directly:

```bash
railway run npx prisma db execute --stdin <<SQL
SELECT id, email, name, plan, "createdAt" FROM "User";
SQL
```

## Session Management

Sessions are stored in the database with:

- `token`: JWT token string
- `userId`: Reference to user
- `expiresAt`: Token expiration timestamp (7 days from creation)
- `createdAt`: Session creation time

### Check Active Sessions

```bash
railway run npx prisma db execute --stdin <<SQL
SELECT s.id, s."userId", u.email, s."createdAt", s."expiresAt"
FROM "Session" s
JOIN "User" u ON s."userId" = u.id
WHERE s."expiresAt" > NOW();
SQL
```

## Next Steps

After authentication is working:

1. ✅ Test signup endpoint
2. ✅ Test login endpoint
3. ✅ Test protected routes with token
4. ✅ Test logout
5. ✅ Verify sessions in database
6. 🔨 Connect frontend to backend auth
7. 🔨 Update Vercel environment variables with Railway URL
8. 🔨 Test full auth flow from frontend

## Troubleshooting

### Issue: "JWT_SECRET is not defined"

**Solution:** Set JWT_SECRET in Railway environment variables:

```bash
# Generate a secure secret
openssl rand -base64 32

# Add to Railway Variables tab
JWT_SECRET=your_generated_secret_here
```

### Issue: "PrismaClientInitializationError"

**Solution:** Verify DATABASE_URL is set and migrations are applied:

```bash
railway run npx prisma migrate deploy
```

### Issue: "User not found after signup"

**Solution:** Check Railway logs for database connection errors. Ensure both services (PostgreSQL and backend) are in the same region (eu-west-1).

### Issue: "CORS errors from frontend"

**Solution:** Ensure FRONTEND_URL environment variable is set correctly in Railway:

```bash
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Security Notes

- ✅ Passwords are hashed with bcrypt (10 rounds)
- ✅ JWT tokens expire after 7 days
- ✅ Sessions are stored in database for invalidation
- ✅ Email addresses are stored in lowercase
- ✅ Passwords must be at least 8 characters
- ✅ Protected routes verify token and session validity
- ⚠️ Remember to use HTTPS in production (Railway provides this automatically)
- ⚠️ Keep JWT_SECRET secure and never commit to git

## API Endpoints Summary

| Method | Endpoint             | Auth Required | Description            |
| ------ | -------------------- | ------------- | ---------------------- |
| GET    | `/api/health`        | No            | Health check           |
| POST   | `/api/auth/signup`   | No            | Register new user      |
| POST   | `/api/auth/login`    | No            | Login user             |
| POST   | `/api/auth/logout`   | Yes           | Logout current session |
| GET    | `/api/auth/me`       | Yes           | Get current user       |
| DELETE | `/api/auth/sessions` | Yes           | Logout all sessions    |
